import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { prisma } from './lib/prisma';
import { runAssistantEngine } from './lib/ai/engine';

const SESSION_DIR = process.env.WHATSAPP_SESSION_DIR || path.join(process.cwd(), '.whatsapp_auth');

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let sock: any = null;
let isReconnecting = false;

async function updateDbConnection(data: {
  status: 'disconnected' | 'waiting_qr' | 'connected' | 'error';
  qrCode?: string | null;
  connectedNumber?: string | null;
}) {
  try {
    await prisma.whatsappConnection.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        status: data.status,
        qrCode: data.qrCode,
        connectedNumber: data.connectedNumber,
        lastActiveAt: new Date()
      },
      update: {
        status: data.status,
        ...(data.qrCode !== undefined ? { qrCode: data.qrCode } : {}),
        ...(data.connectedNumber !== undefined ? { connectedNumber: data.connectedNumber } : {}),
        lastActiveAt: new Date()
      }
    });
  } catch (err: any) {
    console.error('[Worker DB] Erro ao atualizar status do WhatsApp:', err.message);
  }
}

async function startWhatsApp() {
  try {
    console.log(`[Worker] Inicializando sessão Baileys em: ${SESSION_DIR}`);
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[Worker] Baileys v${version.join('.')} (Última versão: ${isLatest})`);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['Atende AI', 'Chrome', '120.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('[Worker] Novo QR Code gerado.');
        const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        await updateDbConnection({
          status: 'waiting_qr',
          qrCode: qrDataUrl
        });
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          `[Worker] Conexão encerrada. Motivo:`,
          lastDisconnect?.error,
          `Reconectar:`,
          shouldReconnect
        );

        await updateDbConnection({
          status: 'disconnected',
          qrCode: null
        });

        if (shouldReconnect && !isReconnecting) {
          isReconnecting = true;
          setTimeout(() => {
            isReconnecting = false;
            startWhatsApp();
          }, 5000);
        }
      } else if (connection === 'open') {
        const userJid = sock.user?.id || '';
        const phone = userJid.split(':')[0] || userJid.split('@')[0];
        console.log(`[Worker] ✅ WhatsApp Conectado com sucesso! Número: ${phone}`);

        await updateDbConnection({
          status: 'connected',
          qrCode: null,
          connectedNumber: phone
        });

        await prisma.activityLog.create({
          data: {
            channel: 'whatsapp',
            action: 'whatsapp_connected',
            details: { phone },
            result: 'success'
          }
        });
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify') return;

      for (const msg of m.messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid.includes('@g.us')) continue; // Ignore group messages for 1-on-1 customer service

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          '';

        if (!text.trim()) continue;

        const senderPhone = remoteJid.split('@')[0];
        const senderName = msg.pushName || `Cliente ${senderPhone.slice(-4)}`;

        console.log(`[WhatsApp] Mensagem de ${senderName} (${senderPhone}): "${text}"`);

        // Check if master switch is ON
        const config = await prisma.assistantConfig.findFirst();
        if (config && !config.active) {
          console.log('[Worker] Assistente pausado globalmente. Não respondendo.');
          continue;
        }

        // Find or create Contact
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

        // Find or create Conversation
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

        // If human took over, don't answer automatically
        if (conversation.status === 'human_takeover') {
          console.log(`[Worker] Atendimento sob controle humano para ${senderPhone}. Silenciando IA.`);
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              sender: 'customer',
              text
            }
          });
          continue;
        }

        // Save customer message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: 'customer',
            text
          }
        });

        // Build history for AI
        const historyForAI = (conversation.messages || []).map((prev) => ({
          role: (prev.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: prev.text
        }));
        historyForAI.push({ role: 'user', content: text });

        // Run AI Engine
        try {
          const aiResult = await runAssistantEngine({
            messages: historyForAI,
            channel: 'whatsapp',
            conversationId: conversation.id
          });

          // Send reply via WhatsApp
          await sock.sendMessage(remoteJid, { text: aiResult.text });

          // Save assistant message to DB
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
          console.error('[Worker AI Error]:', engineErr.message);
        }
      }
    });
  } catch (err: any) {
    console.error('[Worker Fatal]:', err);
    await updateDbConnection({ status: 'error' });
  }
}

// Command polling loop for disconnect/restart commands from dashboard
async function startCommandWatcher() {
  setInterval(async () => {
    try {
      const pending = await prisma.workerCommand.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' }
      });

      if (!pending) return;

      console.log(`[Worker] Processando comando: ${pending.command}`);

      if (pending.command === 'disconnect') {
        if (sock) {
          try {
            await sock.logout();
          } catch {}
        }
        // Clear session auth files
        if (fs.existsSync(SESSION_DIR)) {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
          fs.mkdirSync(SESSION_DIR, { recursive: true });
        }
        await updateDbConnection({
          status: 'disconnected',
          qrCode: null,
          connectedNumber: null
        });
        startWhatsApp();
      } else if (pending.command === 'restart' || pending.command === 'start') {
        startWhatsApp();
      }

      await prisma.workerCommand.update({
        where: { id: pending.id },
        data: { status: 'executed' }
      });
    } catch {}
  }, 3000);
}

// Scheduled tasks loop: daily executive summaries & appointment reminders
async function startScheduledTasks() {
  console.log('[Worker] Título das tarefas agendadas ativado (Resumos diários e Lembretes).');
  setInterval(async () => {
    try {
      const now = new Date();
      // Check reminders 2 hours before appointments
      const twoHoursAhead = new Date(now.getTime() + 2 * 60 * 60000);
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          startsAt: { lte: twoHoursAhead, gte: now },
          reminderSent: false,
          status: 'confirmed'
        },
        include: { contact: true }
      });

      for (const appt of upcomingAppointments) {
        if (appt.contact?.phone && sock) {
          const timeStr = appt.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const msg = `Lembrete amigável ✨ Sua reunião "${appt.serviceName}" está agendada para hoje às ${timeStr}. Caso precise reagendar, basta responder a esta mensagem. Te aguardamos!`;
          try {
            const jid = `${appt.contact.phone.replace(/\D/g, '')}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: msg });
            await prisma.appointment.update({
              where: { id: appt.id },
              data: { reminderSent: true }
            });
            console.log(`[Worker] Lembrete enviado para ${appt.contact.name} (${appt.contact.phone})`);
          } catch (e: any) {
            console.error('[Worker] Erro ao enviar lembrete:', e.message);
          }
        }
      }
    } catch {}
  }, 60000); // Check every minute
}

// Start worker
async function main() {
  console.log('🚀 Iniciando Worker Atende (WhatsApp & Tarefas em Segundo Plano)...');
  await startWhatsApp();
  startCommandWatcher();
  startScheduledTasks();
}

main().catch(console.error);
