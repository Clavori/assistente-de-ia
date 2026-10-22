import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read DB
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler db.json:', error);
    throw error;
  }
}

// Helper to write DB
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar db.json:', error);
    throw error;
  }
}

// GET all data
app.get('/api/data', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

// Update Organization
app.put('/api/organization', async (req, res) => {
  try {
    const db = await readDB();
    db.organization = { ...db.organization, ...req.body };
    await writeDB(db);
    res.json({ success: true, organization: db.organization });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar organização' });
  }
});

// Update Settings
app.put('/api/settings', async (req, res) => {
  try {
    const db = await readDB();
    db.settings = { ...db.settings, ...req.body };
    await writeDB(db);
    res.json({ success: true, settings: db.settings });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// Update Behavior
app.put('/api/behavior', async (req, res) => {
  try {
    const db = await readDB();
    db.behavior = { ...db.behavior, ...req.body };
    await writeDB(db);
    res.json({ success: true, behavior: db.behavior });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar comportamento' });
  }
});

// Knowledge: Add/Update Service
app.post('/api/knowledge/services', async (req, res) => {
  try {
    const db = await readDB();
    const service = req.body;
    if (!service.id) {
      service.id = 'srv-' + Date.now();
      db.knowledge.services.push(service);
    } else {
      const idx = db.knowledge.services.findIndex(s => s.id === service.id);
      if (idx !== -1) {
        db.knowledge.services[idx] = service;
      } else {
        db.knowledge.services.push(service);
      }
    }
    await writeDB(db);
    res.json({ success: true, services: db.knowledge.services });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar serviço' });
  }
});

// Knowledge: Delete Service
app.delete('/api/knowledge/services/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.knowledge.services = db.knowledge.services.filter(s => s.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, services: db.knowledge.services });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

// Knowledge: Add/Update FAQ
app.post('/api/knowledge/faqs', async (req, res) => {
  try {
    const db = await readDB();
    const faq = req.body;
    if (!faq.id) {
      faq.id = 'faq-' + Date.now();
      db.knowledge.faqs.push(faq);
    } else {
      const idx = db.knowledge.faqs.findIndex(f => f.id === faq.id);
      if (idx !== -1) {
        db.knowledge.faqs[idx] = faq;
      } else {
        db.knowledge.faqs.push(faq);
      }
    }
    await writeDB(db);
    res.json({ success: true, faqs: db.knowledge.faqs });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar FAQ' });
  }
});

// Knowledge: Delete FAQ
app.delete('/api/knowledge/faqs/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.knowledge.faqs = db.knowledge.faqs.filter(f => f.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true, faqs: db.knowledge.faqs });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir FAQ' });
  }
});

// Helper to generate AI reply for a given message and customer history
async function generateAiReply(message, history = [], db) {
  const servicesText = db.knowledge.services
    .map(s => `- ${s.name}: Duração ${s.duration}, Valor: ${s.price}. Triagem: ${s.triage}`)
    .join('\n');
  const faqsText = db.knowledge.faqs
    .map(f => `P: ${f.question}\nR: ${f.answer}`)
    .join('\n\n');

  const systemPrompt = `${db.behavior.systemInstructions}

INFORMAÇÕES DA EMPRESA:
- Nome: ${db.organization.name}
- Responsável Técnico: ${db.organization.doctor} (${db.organization.cro || ''})
- Especialidade: ${db.organization.segment}
- Endereço: ${db.organization.address}
- Telefone/WhatsApp: ${db.organization.phone}
- Horário: ${db.organization.hours}

CATÁLOGO DE PROCEDIMENTOS / SERVIÇOS:
${servicesText}

PERGUNTAS FREQUENTES (FAQ):
${faqsText}

IMPORTANTE: Responda em português brasileiro com tom ${db.behavior.tone}. Seja simpático, acolhedor e direto.`;

  // If API key is present (Supports OpenRouter, OpenAI, Groq)
  if (db.settings.apiKey && db.settings.apiKey.trim().length > 10) {
    try {
      const key = db.settings.apiKey.trim();
      let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      let model = db.settings.model || "anthropic/claude-3.5-sonnet";

      if (key.startsWith("gsk_")) {
        apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        model = "llama-3.3-70b-versatile";
      } else if (key.startsWith("sk-proj-") || (key.startsWith("sk-") && !key.startsWith("sk-or-"))) {
        apiUrl = "https://api.openai.com/v1/chat/completions";
        model = "gpt-4o-mini";
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://andradestudio.ai",
          "X-Title": "Atende AI Assistant"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-8).map(h => ({
              role: h.sender === 'user' || h.sender === 'customer' ? 'user' : 'assistant',
              content: h.text
            })),
            { role: "user", content: message }
          ],
          temperature: db.settings.temperature || 0.3,
          max_tokens: db.settings.maxTokens || 800
        })
      });

      if (response.ok) {
        const apiData = await response.json();
        return apiData.choices?.[0]?.message?.content || "Desculpe, não consegui processar a resposta.";
      }
    } catch (apiErr) {
      console.warn('Erro ao chamar API de IA externa:', apiErr.message);
    }
  }

  // Fallback engine
  const lower = message.toLowerCase().trim();
  const previousMessages = history.slice(-4);
  const lastBotMsg = previousMessages.filter(m => m.sender === 'bot').pop()?.text?.toLowerCase() || "";

  if (
    lower.includes("respoder") || lower.includes("responder") || lower.includes("atender") || 
    lower.includes("atendimento") || lower.includes("mensagens") || lower.includes("mensagem") ||
    (lastBotMsg.includes("processo ou tarefa que mais toma tempo") && (lower.includes("cliente") || lower.includes("zap") || lower.includes("contato") || lower.includes("venda")))
  ) {
    return `Perfeito! Automatizar a resposta a clientes no WhatsApp é justamente um dos nossos carros-chefe 🚀\n\nCom o nosso assistente inteligente, sua empresa passa a responder dúvidas de produtos, valores e disponibilidade em menos de 2 segundos, 24 horas por dia, sem deixar ninguém no vácuo e qualificando o lead antes de passar para você.\n\nQual é o volume aproximado de mensagens ou clientes que chamam você por dia no WhatsApp?`;
  } else if (
    (lastBotMsg.includes("volume aproximado de mensagens") || lastBotMsg.includes("chamam você por dia")) &&
    (/\d+/.test(lower) || lower.includes("muito") || lower.includes("bastante") || lower.includes("pouco") || lower.includes("vários") || lower.includes("varios") || lower.includes("dia"))
  ) {
    return `Excelente! Esse volume já justifica totalmente a automação — você vai economizar horas diárias da equipe e parar de perder vendas por demora no atendimento.\n\nPodemos fazer uma demonstração rápida de 30 minutos via Google Meet para você ver o assistente funcionando na prática com o seu nicho? Temos horário amanhã às 14:00 ou 16:30. Qual fica melhor para você?`;
  } else if (
    (lastBotMsg.includes("14:00 ou 16:30") || lastBotMsg.includes("demonstração rápida") || lastBotMsg.includes("qual fica melhor")) &&
    (lower.includes("14") || lower.includes("16") || lower.includes("tarde") || lower.includes("pode ser") || lower.includes("prefiro") || lower.includes("qualquer"))
  ) {
    return `Perfeito! Horário reservado para amanhã às 14:00 ✅\n\nPara eu te enviar o convite com o link do Google Meet e preparar a demonstração personalizada para o seu nicho, qual é o seu **Nome Completo** e **E-mail**?`;
  } else if (lower.includes("olá") || lower.includes("ola") || lower.includes("oi") || lower.includes("bom dia") || lower.includes("boa tarde") || lower.includes("boa noite")) {
    return db.behavior.welcomeMessage;
  } else if (lower.includes("site") || lower.includes("landing page") || lower.includes("página") || lower.includes("pagina") || lower.includes("institucional") || lower.includes("web")) {
    const srv = db.knowledge.services.find(s => s.name.toLowerCase().includes("site"));
    return `Na ${db.organization.name}, criamos sites institucionais e landing pages de alta conversão, com design moderno responsivo, alta velocidade de carregamento e botão para WhatsApp. O investimento é ${srv ? srv.price : 'a partir de R$ 1.800,00'} e entregamos entre ${srv ? srv.duration : '7 a 15 dias úteis'}. Você já tem a estrutura do site em mente ou gostaria de ajuda com o planejamento?`;
  } else if (lower.includes("app") || lower.includes("aplicativo") || lower.includes("saas") || lower.includes("sistema") || lower.includes("plataforma") || lower.includes("software")) {
    const srv = db.knowledge.services.find(s => s.name.toLowerCase().includes("aplicativo"));
    return `Desenvolvemos aplicativos web e plataformas SaaS sob medida: autenticação, painel administrativo, banco de dados em nuvem e meios de pagamento integrados. O investimento é ${srv ? srv.price : 'a partir de R$ 4.500,00'}, com prazo médio de ${srv ? srv.duration : '20 a 60 dias úteis'}. Você já tem algum protótipo no Figma ou a lista das principais funções?`;
  } else if (lower.includes("automação") || lower.includes("automacao") || lower.includes("n8n") || lower.includes("make") || lower.includes("processo") || lower.includes("fluxo")) {
    const srv = db.knowledge.services.find(s => s.name.toLowerCase().includes("automação"));
    return `Nossas automações inteligentes conectam seus sistemas (WhatsApp, CRM, ERP, planilhas e e-mails) usando IA para eliminar tarefas manuais e repetitivas. O investimento é ${srv ? srv.price : 'a partir de R$ 1.500,00'}, prontas entre ${srv ? srv.duration : '5 a 12 dias úteis'}. Qual é o processo ou tarefa que mais toma tempo da sua equipe hoje?`;
  } else if (lower.includes("whatsapp") || lower.includes("chatbot") || lower.includes("assistente") || lower.includes("bot") || lower.includes("atendimento")) {
    const srv = db.knowledge.services.find(s => s.name.toLowerCase().includes("assistente"));
    return `Criamos assistentes virtuais de atendimento com IA treinados sob medida para o seu negócio! O assistente responde no WhatsApp 24h por dia em menos de 2 segundos, tira dúvidas de serviços, qualifica o lead e agenda reuniões. O projeto é ${srv ? srv.price : 'a partir de R$ 2.200,00'}. Quantas mensagens em média você costuma receber por dia?`;
  } else if (lower.includes("preço") || lower.includes("preco") || lower.includes("valor") || lower.includes("custa") || lower.includes("quanto")) {
    return `Nossos projetos têm valores base transparentes:\n• Sites & Landing Pages: a partir de R$ 1.800,00\n• Automações com IA: a partir de R$ 1.500,00\n• Assistente de IA para WhatsApp: a partir de R$ 2.200,00\n• Aplicativos Web/SaaS: a partir de R$ 4.500,00\n\nPodemos fazer uma call rápida de 30 minutos sem compromisso para montar uma proposta exata para o seu projeto?`;
  } else if (lower.includes("agendar") || lower.includes("marcar") || lower.includes("reunião") || lower.includes("reuniao") || lower.includes("call") || lower.includes("horário") || lower.includes("horario") || lower.includes("amanhã") || lower.includes("amanha")) {
    return `Excelente! Nossas reuniões de diagnóstico e alinhamento técnico têm duração de 30 minutos via Google Meet. Temos disponibilidade:\n• Amanhã: às 10:00 ou às 15:30\n• Depois de amanhã: às 11:00 ou às 16:30\n\nQual horário fica melhor para você? Por favor, me informe seu nome completo e WhatsApp!`;
  } else {
    return `Entendido! Na ${db.organization.name} somos especialistas em transformar ideias em soluções digitais de ponta (criação de sites, desenvolvimento de apps, automações de processos e agentes de IA para WhatsApp). Você prefere conversar sobre criar um site, aplicativo ou automatizar o atendimento?`;
  }
}

// Chat Engine (Sandbox)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const db = await readDB();

    if (!db.settings.active) {
      return res.json({
        reply: "⚠️ O assistente de atendimento está desativado no momento pelo painel geral.",
        active: false
      });
    }

    const reply = await generateAiReply(message, history, db);
    res.json({ reply, provider: "Andrade AI Core", model: db.settings.model });
  } catch (err) {
    console.error("Erro no chat:", err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// ==================== WEBHOOK WHATSAPP (Evolution API / Z-API) ====================
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const payload = req.body;
    const db = await readDB();

    if (!db.settings.active) {
      return res.status(200).json({ status: "ignored_assistant_inactive" });
    }

    // Extract message, sender phone and name from standard Evolution API or Z-API payloads
    let userText = "";
    let remoteJid = "";
    let senderName = "Cliente WhatsApp";
    let isFromMe = false;

    // Evolution API format:
    if (payload.data && payload.data.key) {
      isFromMe = payload.data.key.fromMe;
      remoteJid = payload.data.key.remoteJid || "";
      senderName = payload.data.pushName || "Cliente";
      const msg = payload.data.message;
      userText = msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || "";
    } 
    // Generic / Simple Webhook format:
    else if (payload.phone && payload.message) {
      remoteJid = payload.phone;
      userText = payload.message;
      senderName = payload.name || "Cliente";
      isFromMe = false;
    }

    // If message is sent by the bot itself or empty, ignore to prevent infinite loop
    if (isFromMe || !userText || !remoteJid) {
      return res.status(200).json({ status: "ignored" });
    }

    const phoneOnly = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Retrieve or create conversation record
    let conversation = db.conversations.find(c => c.customerPhone.includes(phoneOnly) || phoneOnly.includes(c.customerPhone));
    if (!conversation) {
      conversation = {
        id: "conv-" + Date.now(),
        customerName: senderName,
        customerPhone: "+" + phoneOnly,
        channel: "WhatsApp",
        status: "Em andamento",
        intent: "Atendimento WhatsApp",
        lastMessageTime: timeNow,
        messages: []
      };
      db.conversations.unshift(conversation);
    }

    // Add user message to history
    conversation.messages.push({
      sender: "customer",
      text: userText,
      time: timeNow
    });

    // Generate AI response
    const reply = await generateAiReply(userText, conversation.messages, db);

    // Add bot response to history
    conversation.messages.push({
      sender: "bot",
      text: reply,
      time: timeNow
    });
    conversation.lastMessageTime = timeNow;

    // Save to database
    await writeDB(db);

    console.log(`\n💬 [WhatsApp Webhook] Mensagem de ${senderName} (${phoneOnly}): "${userText}"`);
    console.log(`🤖 [Aura Respondeu]: "${reply.substring(0, 80)}..."\n`);

    // Return response in standard webhook format
    // (If using Evolution API or similar, return the text to be sent, or call sendText endpoint)
    return res.status(200).json({
      success: true,
      phone: remoteJid,
      reply: reply
    });
  } catch (err) {
    console.error("Erro no Webhook WhatsApp:", err);
    res.status(500).json({ error: "Erro interno no processamento do webhook" });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 ATENDE AI ASSISTANT PLATFORM (Andrade Studio AI)`);
  console.log(`  🌐 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
