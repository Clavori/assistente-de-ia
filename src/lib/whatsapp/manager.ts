import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma';
import { runAssistantEngine } from '../ai/engine';

const SESSION_DIR = process.env.VERCEL
  ? '/tmp/.whatsapp_auth'
  : process.env.WHATSAPP_SESSION_DIR || path.join(process.cwd(), '.whatsapp_auth');

interface WAState {
  sock: any;
  status: 'disconnected' | 'waiting_qr' | 'connecting' | 'connected' | 'error';
  qrCode: string | null;
  pairingCode: string | null;
  connectedNumber: string | null;
  isStarting: boolean;
  cachedVersion: [number, number, number] | null;
  lastUpdated: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __waState: WAState | undefined;
}

function getWAState(): WAState {
  if (!global.__waState) {
    global.__waState = {
      sock: null,
      status: 'disconnected',
      qrCode: null,
      pairingCode: null,
      connectedNumber: null,
      isStarting: false,
      cachedVersion: null,
      lastUpdated: Date.now()
    };
  }
  return global.__waState;
}

async function syncStateToDb(state: WAState) {
  try {
    const dbStatus = state.status === 'connecting' ? 'waiting_qr' : state.status;
    await prisma.whatsAppConnection.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        status: dbStatus,
        qrCode: state.qrCode,
        connectedNumber: state.connectedNumber,
        lastActiveAt: new Date()
      },
      update: {
        status: dbStatus,
        qrCode: state.qrCode,
        connectedNumber: state.connectedNumber,
        lastActiveAt: new Date()
      }
    });
  } catch (err: any) {
    console.warn('[WA Manager DB Sync]:', err.message);
  }
}

export async function startWhatsAppSession(forceClean = false): Promise<WAState> {
  const state = getWAState();

  if (state.isStarting) {
    return state;
  }

  state.isStarting = true;

  try {
    // Close previous socket cleanly if any
    if (state.sock) {
      try {
        state.sock.ev.removeAllListeners('connection.update');
        state.sock.ev.removeAllListeners('creds.update');
        state.sock.ev.removeAllListeners('messages.upsert');
        state.sock.end(undefined);
      } catch {}
      state.sock = null;
    }

    if (forceClean && fs.existsSync(SESSION_DIR)) {
      try {
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
      } catch {}
    }

    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state: authState, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    if (!state.cachedVersion) {
      try {
        const { version } = await fetchLatestBaileysVersion();
        state.cachedVersion = version;
      } catch {
        state.cachedVersion = [2, 3000, 1015901307];
      }
    }

    const sock = makeWASocket({
      version: state.cachedVersion,
      auth: authState,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      defaultQueryTimeoutMs: 30000
    });

    state.sock = sock;
    state.isStarting = false;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          state.status = 'waiting_qr';
          state.qrCode = qrDataUrl;
          state.lastUpdated = Date.now();
          await syncStateToDb(state);
        } catch (qrErr) {
          console.error('[WA Manager] Erro ao gerar imagem QR:', qrErr);
        }
      }

      if (connection === 'connecting') {
        if (state.status !== 'waiting_qr') {
          state.status = 'connecting';
          state.lastUpdated = Date.now();
        }
      }

      if (connection === 'open') {
        const userJid = sock.user?.id || '';
        const phone = (userJid.split(':')[0] || userJid.split('@')[0]).replace(/\D/g, '');
        console.log(`[WA Manager] ✅ WhatsApp Conectado! Número: +${phone}`);

        state.status = 'connected';
        state.qrCode = null;
        state.pairingCode = null;
        state.connectedNumber = phone;
        state.lastUpdated = Date.now();
        await syncStateToDb(state);

        await prisma.activityLog
          .create({
            data: {
              channel: 'whatsapp',
              action: 'whatsapp_connected',
              details: { phone },
              result: 'success'
            }
          })
          .catch(() => {});
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const isRestartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515;

        console.log(
          `[WA Manager] Conexão fechada (code: ${statusCode}). RestartRequired: ${isRestartRequired}, LoggedOut: ${isLoggedOut}`
        );

        if (isLoggedOut) {
          state.status = 'disconnected';
          state.qrCode = null;
          state.pairingCode = null;
          state.connectedNumber = null;
          await syncStateToDb(state);
          // Clean logged-out credentials and prepare fresh QR
          setTimeout(() => startWhatsAppSession(true), 800);
        } else if (isRestartRequired) {
          // CRITICAL: Right after scanning QR code, WhatsApp sends 515 (restartRequired).
          // Reconnect IMMEDIATELY (<150ms) and keep status as 'connecting' so pairing succeeds!
          state.status = 'connecting';
          state.qrCode = null;
          setTimeout(() => startWhatsAppSession(false), 150);
        } else {
          // Normal timeout or network hiccup: reconnect quickly
          setTimeout(() => startWhatsAppSession(false), 1500);
        }
      }
    });

    // Incoming WhatsApp messages handler
    sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify') return;

      for (const msg of m.messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('status@broadcast')) {
          continue;
        }

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          '';

        if (!text.trim()) continue;

        const senderPhone = remoteJid.split('@')[0];
        const senderName = msg.pushName || `Cliente ${senderPhone.slice(-4)}`;

        console.log(`[WhatsApp] Mensagem de ${senderName} (${senderPhone}): "${text}"`);

        const config = await prisma.assistantConfig.findFirst();
        if (config && !config.active) {
          continue;
        }

        let contact = await prisma.contact.findFirst({
          where: { phone: senderPhone }
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              name: senderName,
              phone: senderPhone,
              channel: 'whatsapp'
            }
          });
        }

        let conversation = await prisma.conversation.findFirst({
          where: {
            channel: 'whatsapp',
            remoteId: remoteJid,
            status: { not: 'closed' }
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 10
            }
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              channel: 'whatsapp',
              remoteId: remoteJid,
              status: 'bot_active',
              contactId: contact.id
            },
            include: {
              messages: true
            }
          });
        }

        if (conversation.status === 'human_takeover') {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              sender: 'customer',
              text
            }
          });
          continue;
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: 'customer',
            text
          }
        });

        const historyForAI = (conversation.messages || []).map((prev) => ({
          role: (prev.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: prev.text
        }));
        historyForAI.push({ role: 'user', content: text });

        try {
          const aiResult = await runAssistantEngine({
            messages: historyForAI,
            channel: 'whatsapp',
            conversationId: conversation.id
          });

          await sock.sendMessage(remoteJid, { text: aiResult.text });

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              sender: 'assistant',
              text: aiResult.text,
              toolsUsed: aiResult.toolsUsed
            }
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
          });
        } catch (engineErr: any) {
          console.error('[WA Manager AI Error]:', engineErr.message);
        }
      }
    });

    return state;
  } catch (err: any) {
    console.error('[WA Manager Init Error]:', err.message);
    state.isStarting = false;
    state.status = 'error';
    return state;
  }
}

export async function getWhatsAppStatus() {
  const state = getWAState();

  // Automatically start session if never started
  if (!state.sock && !state.isStarting && state.status === 'disconnected') {
    await startWhatsAppSession(false);
    // Wait up to 1.8s on initial request if QR is being generated right now
    let waited = 0;
    while (!state.qrCode && state.status !== 'connected' && waited < 1800) {
      await new Promise((r) => setTimeout(r, 200));
      waited += 200;
    }
  }

  return {
    status: state.status,
    qrCode: state.qrCode,
    pairingCode: state.pairingCode,
    connectedNumber: state.connectedNumber,
    lastActiveAt: new Date(state.lastUpdated).toISOString()
  };
}

export async function disconnectWhatsAppSession() {
  const state = getWAState();
  if (state.sock) {
    try {
      await state.sock.logout();
    } catch {}
    try {
      state.sock.end(undefined);
    } catch {}
    state.sock = null;
  }

  if (fs.existsSync(SESSION_DIR)) {
    try {
      fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    } catch {}
  }

  state.status = 'disconnected';
  state.qrCode = null;
  state.pairingCode = null;
  state.connectedNumber = null;
  await syncStateToDb(state);

  // Immediately start a fresh session so a new QR code is ready
  await startWhatsAppSession(true);
  return getWhatsAppStatus();
}

export async function requestWhatsAppPairingCode(phoneNumber: string): Promise<string> {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Informe o número completo com DDI (55) e DDD. Ex: 5511999999999');
  }

  let state = getWAState();
  if (!state.sock) {
    state = await startWhatsAppSession(false);
    await new Promise((r) => setTimeout(r, 1200));
  }

  if (!state.sock) {
    throw new Error('Sessão do WhatsApp ainda está iniciando. Tente novamente em 2 segundos.');
  }

  const code = await state.sock.requestPairingCode(cleanPhone);
  const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
  state.pairingCode = formattedCode;
  return formattedCode;
}
