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
  isSocketOpen: boolean;
  processingCount: number;
  processedMsgIds: Set<string>;
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
      isSocketOpen: false,
      processingCount: 0,
      processedMsgIds: new Set<string>(),
      cachedVersion: null,
      lastUpdated: Date.now()
    };
  }
  return global.__waState;
}

/**
 * Check if valid Baileys credentials (`me.id`) actually exist on disk
 */
function getPairedPhoneFromDisk(): string | null {
  try {
    const credsFile = path.join(SESSION_DIR, 'creds.json');
    if (!fs.existsSync(credsFile)) return null;
    const raw = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
    const meId = raw?.me?.id || '';
    if (!meId) return null;
    const phone = (meId.split(':')[0] || meId.split('@')[0]).replace(/\D/g, '');
    return phone || null;
  } catch {
    return null;
  }
}

/**
 * Backup auth directory files into database so serverless container recycles don't lose session
 */
async function backupAuthDirToDb() {
  try {
    if (!fs.existsSync(SESSION_DIR)) return;
    const files = fs.readdirSync(SESSION_DIR);
    if (!files.includes('creds.json')) return;

    const fileMap: Record<string, string> = {};
    for (const file of files) {
      const fullPath = path.join(SESSION_DIR, file);
      if (fs.statSync(fullPath).isFile()) {
        fileMap[file] = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    await prisma.integration.upsert({
      where: { provider: 'whatsapp_baileys_session' },
      create: {
        provider: 'whatsapp_baileys_session',
        status: 'connected',
        settings: fileMap as any,
        lastSyncAt: new Date()
      },
      update: {
        status: 'connected',
        settings: fileMap as any,
        lastSyncAt: new Date()
      }
    });
  } catch {}
}

/**
 * Restore auth directory files from database if disk directory is empty
 */
async function restoreAuthDirFromDbIfNeeded() {
  try {
    const credsFile = path.join(SESSION_DIR, 'creds.json');
    if (fs.existsSync(credsFile)) return;

    const saved = await prisma.integration.findUnique({
      where: { provider: 'whatsapp_baileys_session' }
    });
    if (!saved || saved.status !== 'connected' || !saved.settings) return;

    const fileMap = saved.settings as Record<string, string>;
    if (!fileMap['creds.json']) return;

    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    for (const [fileName, content] of Object.entries(fileMap)) {
      if (typeof content === 'string') {
        fs.writeFileSync(path.join(SESSION_DIR, fileName), content, 'utf-8');
      }
    }
  } catch {}
}

/**
 * Unwrap ephemeral, viewOnce, edited or nested WhatsApp message objects and extract text
 */
function extractMessageText(messageObj: any): string {
  if (!messageObj) return '';

  const inner =
    messageObj.ephemeralMessage?.message ||
    messageObj.viewOnceMessage?.message ||
    messageObj.viewOnceMessageV2?.message ||
    messageObj.viewOnceMessageV2Extension?.message ||
    messageObj.documentWithCaptionMessage?.message ||
    messageObj.editedMessage?.message?.protocolMessage?.editedMessage ||
    messageObj;

  return (
    inner.conversation ||
    inner.extendedTextMessage?.text ||
    inner.imageMessage?.caption ||
    inner.videoMessage?.caption ||
    inner.documentMessage?.caption ||
    inner.buttonsResponseMessage?.selectedDisplayText ||
    inner.listResponseMessage?.title ||
    inner.templateButtonReplyMessage?.selectedDisplayText ||
    ''
  );
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
      state.isSocketOpen = false;
    }

    if (forceClean) {
      state.status = 'disconnected';
      state.connectedNumber = null;
      state.qrCode = null;
      state.pairingCode = null;
      state.isSocketOpen = false;
      if (fs.existsSync(SESSION_DIR)) {
        try {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        } catch {}
      }
      await prisma.integration
        .delete({ where: { provider: 'whatsapp_baileys_session' } })
        .catch(() => {});
    } else {
      await restoreAuthDirFromDbIfNeeded();
    }

    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state: authState, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    // Check if authState genuinely has a paired phone
    const pairedPhone = getPairedPhoneFromDisk();
    if (pairedPhone) {
      state.status = 'connected';
      state.connectedNumber = pairedPhone;
      state.qrCode = null;
      await syncStateToDb(state);
    }

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

    sock.ev.on('creds.update', async () => {
      await saveCreds();
      const meId = authState.creds?.me?.id;
      if (meId) {
        const phone = (meId.split(':')[0] || meId.split('@')[0]).replace(/\D/g, '');
        if (phone) {
          state.status = 'connected';
          state.connectedNumber = phone;
          state.qrCode = null;
          state.pairingCode = null;
          state.lastUpdated = Date.now();
          await syncStateToDb(state);
          await backupAuthDirToDb();
        }
      }
    });

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
          state.connectedNumber = null;
          state.isSocketOpen = false;
          state.lastUpdated = Date.now();
          await syncStateToDb(state);
        } catch (qrErr) {
          console.error('[WA Manager] Erro ao gerar imagem QR:', qrErr);
        }
      }

      if (connection === 'open') {
        const userJid = sock.user?.id || authState.creds?.me?.id || '';
        const phone = (userJid.split(':')[0] || userJid.split('@')[0]).replace(/\D/g, '');
        console.log(`[WA Manager] ✅ WhatsApp Conectado e Ativo! Número: +${phone}`);

        state.status = 'connected';
        state.isSocketOpen = true;
        state.qrCode = null;
        state.pairingCode = null;
        state.connectedNumber = phone || state.connectedNumber;
        state.lastUpdated = Date.now();
        await syncStateToDb(state);
        await backupAuthDirToDb();

        await prisma.activityLog
          .create({
            data: {
              channel: 'whatsapp',
              action: 'whatsapp_connected',
              details: { phone: state.connectedNumber },
              result: 'success'
            }
          })
          .catch(() => {});
      }

      if (connection === 'close') {
        state.isSocketOpen = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const isRestartRequired =
          statusCode === DisconnectReason.restartRequired || statusCode === 515;

        if (isLoggedOut) {
          console.log('[WA Manager] Sessão desconectada pelo aparelho (401). Gerando novo QR...');
          setTimeout(() => startWhatsAppSession(true), 300);
          return;
        }

        // If credentials exist on disk, keep status as 'connected' and immediately reconnect socket
        if (getPairedPhoneFromDisk() || authState.creds?.me?.id) {
          state.status = 'connected';
          state.qrCode = null;
          setTimeout(() => startWhatsAppSession(false), isRestartRequired ? 150 : 1200);
          return;
        }

        if (isRestartRequired) {
          state.status = 'connecting';
          state.qrCode = null;
          setTimeout(() => startWhatsAppSession(false), 150);
        } else {
          setTimeout(() => startWhatsAppSession(false), 1500);
        }
      }
    });

    // Incoming WhatsApp messages handler
    sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify' && m.type !== 'append') return;

      for (const msg of m.messages || []) {
        if (!msg.message || msg.key?.fromMe) continue;

        const msgId = msg.key?.id;
        if (msgId) {
          if (state.processedMsgIds.has(msgId)) continue;
          state.processedMsgIds.add(msgId);
          if (state.processedMsgIds.size > 500) {
            const first = state.processedMsgIds.values().next().value;
            if (first) state.processedMsgIds.delete(first);
          }
        }

        // Ignore old history messages when m.type === 'append' (only process messages from the last 3 minutes)
        const rawTs = Number(msg.messageTimestamp || 0);
        if (rawTs > 0) {
          const msgEpochMs = rawTs < 1e12 ? rawTs * 1000 : rawTs;
          if (Date.now() - msgEpochMs > 180_000) {
            continue;
          }
        }

        const remoteJid = msg.key?.remoteJid;
        if (
          !remoteJid ||
          remoteJid.includes('@g.us') ||
          remoteJid.includes('status@broadcast') ||
          remoteJid.includes('@newsletter')
        ) {
          continue;
        }

        const text = extractMessageText(msg.message);
        if (!text.trim()) continue;

        state.processingCount++;
        try {
          const rawSender =
            (msg.key as any)?.senderPn ||
            msg.key?.participant ||
            remoteJid;
          const senderPhone = String(rawSender).split('@')[0].split(':')[0];
          const senderName = msg.pushName || `Cliente ${senderPhone.slice(-4)}`;

          console.log(`[WhatsApp] 📩 Mensagem de ${senderName} (${remoteJid}): "${text}"`);

          const config = await prisma.assistantConfig.findFirst();
          if (config && !config.active) {
            console.log('[WhatsApp] Assistente pausado no painel. Ignorando resposta.');
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
                whatsappLid: remoteJid.endsWith('@lid') ? remoteJid : null,
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
                take: 12
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

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              sender: 'customer',
              text
            }
          });

          if (conversation.status === 'human_takeover') {
            console.log(`[WhatsApp] Conversa ${conversation.id} em atendimento humano.`);
            continue;
          }

          const historyForAI = (conversation.messages || []).map((prev) => ({
            role: (prev.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: prev.text
          }));
          historyForAI.push({ role: 'user', content: text });

          const aiResult = await runAssistantEngine({
            messages: historyForAI,
            channel: 'whatsapp',
            conversationId: conversation.id
          });

          await sock.sendMessage(remoteJid, { text: aiResult.text });
          console.log(`[WhatsApp] ✅ Resposta enviada para ${senderName}: "${aiResult.text.slice(0, 60)}..."`);

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
          await prisma.activityLog
            .create({
              data: {
                channel: 'whatsapp',
                action: 'whatsapp_reply_error',
                details: { error: engineErr.message, remoteJid, text },
                result: 'error'
              }
            })
            .catch(() => {});
        } finally {
          state.processingCount = Math.max(0, state.processingCount - 1);
        }
      }
    });

    return state;
  } catch (err: any) {
    console.error('[WA Manager Init Error]:', err.message);
    state.isStarting = false;
    return state;
  }
}

export async function getWhatsAppStatus(options?: { heartbeat?: boolean }) {
  const state = getWAState();

  await restoreAuthDirFromDbIfNeeded();
  const diskPhone = getPairedPhoneFromDisk();

  if (diskPhone) {
    state.status = 'connected';
    state.connectedNumber = diskPhone;
    state.qrCode = null;
  } else if (state.status === 'connected' && !state.isSocketOpen) {
    // No credentials on disk and socket is not open -> reset so real QR code is shown
    state.status = 'disconnected';
    state.connectedNumber = null;
  }

  // Ensure socket is running
  if (!state.sock && !state.isStarting) {
    await startWhatsAppSession(false);
    let waited = 0;
    while (!state.qrCode && state.status !== 'connected' && waited < 1800) {
      await new Promise((r) => setTimeout(r, 200));
      waited += 200;
    }
  }

  // On Vercel Serverless, keep the function CPU awake during heartbeat polls
  // and never return while an incoming WhatsApp message is mid-processing!
  if (options?.heartbeat && state.status === 'connected') {
    if (process.env.VERCEL) {
      await new Promise((r) => setTimeout(r, 2200));
    }
    let waitProcessing = 0;
    while (state.processingCount > 0 && waitProcessing < 12000) {
      await new Promise((r) => setTimeout(r, 250));
      waitProcessing += 250;
    }
  }

  return {
    status: state.status,
    isSocketOpen: state.isSocketOpen,
    qrCode: state.qrCode,
    pairingCode: state.pairingCode,
    connectedNumber: state.connectedNumber,
    lastActiveAt: new Date(state.lastUpdated).toISOString()
  };
}

export async function markWhatsAppConnected(phone?: string | null) {
  return getWhatsAppStatus({ heartbeat: true });
}

export async function disconnectWhatsAppSession() {
  const state = getWAState();
  if (state.sock) {
    try {
      state.sock.ev.removeAllListeners('connection.update');
      state.sock.ev.removeAllListeners('creds.update');
      state.sock.ev.removeAllListeners('messages.upsert');
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

  await prisma.integration
    .delete({ where: { provider: 'whatsapp_baileys_session' } })
    .catch(() => {});

  state.status = 'disconnected';
  state.isSocketOpen = false;
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
