import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@atiende.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';

  // 1. Check or create Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Administrador Andrade Studio',
        role: 'admin'
      }
    });
    console.log(`✅ Administrador criado: ${adminEmail}`);
  }

  // 2. Business: AndradeStudio
  const existingBusiness = await prisma.business.findFirst();
  const businessData = {
    name: 'AndradeStudio',
    activity: 'Sites, Aplicativos, Automações com IA e Vídeos para Empresas',
    address: 'São Paulo - SP • Atendimento em todo o Brasil',
    phone: '+55 11 98765-4321',
    website: 'https://andrade-studio.vercel.app',
    agencyName: 'AndradeStudio',
    agencyLogo: '/assets/logo.png',
    timeZone: 'America/Sao_Paulo',
    hoursConfig: {
      segunda: { open: '09:00', close: '18:00', lunchBreak: '12:00-13:00', active: true },
      terca: { open: '09:00', close: '18:00', lunchBreak: '12:00-13:00', active: true },
      quarta: { open: '09:00', close: '18:00', lunchBreak: '12:00-13:00', active: true },
      quinta: { open: '09:00', close: '18:00', lunchBreak: '12:00-13:00', active: true },
      sexta: { open: '09:00', close: '18:00', lunchBreak: '12:00-13:00', active: true },
      sabado: { open: '09:00', close: '13:00', active: false },
      domingo: { open: 'fechado', active: false }
    },
    afterHoursAction: 'continue_booking'
  };

  if (!existingBusiness) {
    await prisma.business.create({ data: businessData });
    console.log('✅ Empresa criada: Andrade Studio AI');
  } else {
    await prisma.business.update({
      where: { id: existingBusiness.id },
      data: businessData
    });
    console.log('✅ Empresa atualizada: Andrade Studio AI');
  }

  // 3. Assistant Config
  const existingConfig = await prisma.assistantConfig.findFirst();
  const welcomePtBr = 'Olá! Seja bem-vindo à Andrade Studio AI 🚀 Sou o assistente virtual especializado em tecnologia e IA. Posso te apresentar nossos serviços de desenvolvimento de sites, aplicativos e automações com IA, ou agendar uma reunião de diagnóstico com nosso time. Como posso te ajudar hoje?';
  const instructionsPtBr = `Você é o assistente virtual oficial da Andrade Studio AI (São Paulo - SP), uma agência e estúdio de tecnologia especializado em Inteligência Artificial, desenvolvimento de sites modernos, aplicativos web/mobile sob medida e automações de processos empresariais com IA.
Seu objetivo é acolher clientes e leads com excelência, entender a necessidade do projeto (site, app, automação de WhatsApp ou integração de IA), esclarecer dúvidas sobre os serviços e agendar uma reunião de diagnóstico online com nossa equipe técnica.

Diretrizes de comunicação:
1. Tom amigável, consultivo e profissional, com respostas claras e objetivas no formato de conversa de WhatsApp.
2. Seja transparente quanto à estimativa de investimento e escopo dos serviços, explicando que cada projeto é desenhado sob medida após reunião técnica.
3. Estimule o cliente a agendar uma sessão de demonstração/briefing nos horários disponíveis.
4. Identifique o interesse principal do cliente (site, aplicativo, automação ou chatbot de IA) e colete nome e telefone para contato.`;

  const neverDoRulesPtBr = [
    'Nunca prometer prazos de entrega milagrosos sem antes realizar o alinhamento técnico do escopo.',
    'Nunca fechar orçamentos definitivos de software complexo sem validação de requisitos pela equipe de engenharia.',
    'Nunca divulgar chaves de API, credenciais ou dados confidenciais de outros clientes e projetos.',
    'Nunca discutir com o cliente; havendo dúvidas complexas ou insatisfação, transferir imediatamente para um especialista humano.'
  ];

  const configData = {
    name: 'Andrade AI',
    tone: 'cercano',
    welcomeMessage: welcomePtBr,
    instructions: instructionsPtBr,
    neverDoRules: neverDoRulesPtBr,
    escalateTriggers: {
      complaint: true,
      urgent: true,
      asksHuman: true,
      unknownAnswer: true,
      customRule: 'Cliente relata incidente crítico em sistema em produção ou solicita proposta corporativa customizada'
    },
    active: true,
    modelSelected: 'anthropic/claude-haiku-5.5',
    safeMode: false
  };

  if (!existingConfig) {
    await prisma.assistantConfig.create({ data: configData });
    console.log('✅ Configuração do Assistente criada');
  } else {
    await prisma.assistantConfig.update({
      where: { id: existingConfig.id },
      data: configData
    });
    console.log('✅ Configuração do Assistente atualizada');
  }

  // 4. Serviços de IA, Sites, Apps e Automação
  await prisma.service.deleteMany({});
  const services = [
    {
      name: 'Reunião de Diagnóstico e Demonstração de IA',
      description: 'Sessão online de 30 minutos com especialista para mapear oportunidades de automação, criação de site ou app para sua empresa.',
      durationMinutes: 30,
      price: 0.00,
      priceFrom: false,
      requiresTriage: false
    },
    {
      name: 'Criação de Landing Page & Site Institucional com IA',
      description: 'Design moderno, ultra-rápido, responsivo, otimizado para SEO, integrado a WhatsApp e com assistente de conversão 24h.',
      durationMinutes: 45,
      price: 1950.00,
      priceFrom: true,
      requiresTriage: false
    },
    {
      name: 'Desenvolvimento de Aplicativo Web Sob Medida (SaaS)',
      description: 'Sistemas web completos com Next.js, banco de dados em nuvem, controle de usuários, pagamentos e painel administrativo.',
      durationMinutes: 60,
      price: 4900.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Agente de IA para WhatsApp & Atendimento Automático',
      description: 'Implantação de assistente inteligente com Baileys/OpenRouter conectado à agenda do Google Calendar, CRM e disparo de alertas.',
      durationMinutes: 45,
      price: 2400.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Automação de Processos Empresariais com IA (n8n / Make)',
      description: 'Conexão e automação de fluxos de trabalho entre CRM, planilhas Google Sheets, e-mails Gmail, Slack e emissão de notas.',
      durationMinutes: 45,
      price: 1800.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Desenvolvimento de Aplicativo Mobile (iOS & Android)',
      description: 'Aplicativo híbrido de alta performance com React Native / Flutter, notificações push e integração a backend em nuvem.',
      durationMinutes: 60,
      price: 7800.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Integração de APIs de Inteligência Artificial & LLMs',
      description: 'Treinamento de RAG (Busca Vetorial) sobre base de conhecimento da empresa com modelos Claude 3.5, GPT-4o ou Llama 3.',
      durationMinutes: 60,
      price: 3200.00,
      priceFrom: true,
      requiresTriage: true
    },
    {
      name: 'Suporte Técnico Contínuo & Evolução de Software',
      description: 'Manutenção proativa mensal, monitoramento de servidores, melhorias contínuas de recursos e acompanhamento de métricas.',
      durationMinutes: 30,
      price: 950.00,
      priceFrom: true,
      requiresTriage: false
    }
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log('✅ 8 Serviços criados para IA & Desenvolvimento de Software');

  // 5. Perguntas Frequentes (FAQs de Tecnologia & IA)
  await prisma.faq.deleteMany({});
  const faqs = [
    {
      question: 'A reunião de diagnóstico e demonstração é gratuita?',
      answer: 'Sim! Nossa sessão inicial de 30 minutos é 100% gratuita. Nela entendemos os gargalos do seu negócio e apresentamos uma demonstração prática de como a IA ou um app sob medida podem acelerar suas vendas.'
    },
    {
      question: 'Quanto tempo leva para criar um site institucional ou landing page?',
      answer: 'Landing pages de alta conversão costumam ser entregues em até 5 a 7 dias úteis. Sites institucionais completos com blog e integrações levam em média de 10 a 20 dias.'
    },
    {
      question: 'Como funciona o assistente de IA para WhatsApp?',
      answer: 'O agente inteligente é conectado diretamente ao WhatsApp da sua empresa, respondendo dúvidas dos clientes em segundos, qualificando leads, agendando reuniões no Google Calendar e acionando sua equipe humana quando necessário.'
    },
    {
      question: 'Quais tecnologias vocês utilizam no desenvolvimento de aplicativos?',
      answer: 'Trabalhamos com o que há de mais moderno no mercado: Next.js, React, Node.js, TypeScript, Tailwind CSS, PostgreSQL, Docker e as APIs de ponta da OpenAI, Anthropic e OpenRouter.'
    },
    {
      question: 'Como são divididas as formas de pagamento para novos projetos?',
      answer: 'Geralmente facilitamos em parcelas por etapas de entrega (ex: entrada + entrega final) ou em até 12x no cartão de crédito corporativo. Também temos planos mensais para suporte e evolução contínua.'
    },
    {
      question: 'Eu preciso saber programar para gerenciar o site ou o assistente?',
      answer: 'Não! Todos os nossos projetos acompanham painéis intuitivos e amigáveis para que qualquer pessoa da sua equipe consiga alterar textos, serviços, fotos e horários sem digitar nenhuma linha de código.'
    },
    {
      question: 'O que é a automação com IA (n8n / Make / Webhooks)?',
      answer: 'É a conexão inteligente de ferramentas que sua empresa já usa (planilhas, e-mails, CRM, WhatsApp) para eliminar tarefas manuais e repetitivas, fazendo em segundos o que antes levava horas.'
    },
    {
      question: 'Vocês realizam contrato com cláusula de confidencialidade (NDA)?',
      answer: 'Sim, a segurança das suas ideias e dados é prioridade absoluta. Todos os nossos projetos são formalizados com contrato e cláusula de confidencialidade (NDA).'
    },
    {
      question: 'Após a entrega do projeto, vocês dão garantia e suporte?',
      answer: 'Sim! Todos os projetos possuem garantia técnica de 30 dias após o lançamento para eventuais correções, além da opção de plano de evolução contínua mensal.'
    },
    {
      question: 'Como posso dar o primeiro passo para o meu projeto?',
      answer: 'Basta agendar um horário aqui mesmo com o assistente virtual para batermos um papo rápido e estruturarmos a proposta sob medida!'
    }
  ];

  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }
  console.log('✅ 10 FAQs criadas para IA e Tecnologia');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Atualização de serviços e negócio de IA concluída.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao atualizar seed:', err);
      process.exit(1);
    });
}
