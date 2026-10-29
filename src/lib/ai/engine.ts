import { prisma } from '../prisma';
import { AVAILABLE_TOOLS, executeTool, ToolExecutionResult } from './tools';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface EngineResult {
  text: string;
  steps: ToolExecutionResult[];
  toolsUsed: string[];
  modelUsed: string;
  escalated: boolean;
}

/**
 * Builds the dynamic system prompt with Business, AssistantConfig, Services and FAQs
 */
export async function buildSystemPrompt(): Promise<string> {
  const [business, config, services, faqs] = await Promise.all([
    prisma.business.findFirst(),
    prisma.assistantConfig.findFirst(),
    prisma.service.findMany({ orderBy: { price: 'asc' } }),
    prisma.faq.findMany({ take: 15 })
  ]);

  const businessName = business?.name || 'Andrade Studio AI';
  const activity = business?.activity || 'Desenvolvimento de Sites, Aplicativos Web/Mobile e Automações com IA';
  const phone = business?.phone || '+55 11 98765-4321';
  const address = business?.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP';
  const website = business?.website || 'https://andradestudio.ai';
  const timeZone = business?.timeZone || 'America/Sao_Paulo';

  const assistantName = config?.name || 'Andrade AI';
  const tone = config?.tone || 'cercano';
  const instructions = config?.instructions || 'Você é um assistente atencioso e prestativo.';
  const neverDoRules = (config?.neverDoRules as string[]) || [];

  const servicesList = services
    .map(
      (s) =>
        `- ${s.name}: R$ ${Number(s.price || 0).toFixed(2)}${s.priceFrom ? ' (a partir de)' : ''} | Duração: ${s.durationMinutes} min${s.requiresTriage ? ' [Requer alinhamento de escopo]' : ''}. Descrição: ${s.description || 'N/A'}`
    )
    .join('\n');

  const faqsList = faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone
  });
  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone
  });

  return `Você é "${assistantName}", o assistente de IA oficial de "${businessName}".
Empresa: ${businessName}
Ramo de Atuação: ${activity}
Endereço: ${address}
Telefone / WhatsApp: ${phone}
Site oficial: ${website}
Fuso Horário: ${timeZone}
Data e hora atual: ${currentDate}, às ${currentTime}.

TOM DE VOZ:
Seu tom de voz deve ser: "${tone}" (amigável, empático, profissional e objetivo).
Responda de forma ágil e natural, com respostas concisas como em uma conversa real de WhatsApp (evite parágrafos gigantescos e monólogos longos).

INSTRUÇÕES ESPECÍFICAS DO NEGÓCIO:
${instructions}

REGRAS QUE VOCÊ NUNCA DEVE FAZER:
${neverDoRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

CATÁLOGO DE SERVIÇOS DISPONÍVEIS:
${servicesList || 'Consulte através da ferramenta consultar_servicos se necessário.'}

PERGUNTAS FREQUENTES DA EMPRESA:
${faqsList || 'Não há FAQs cadastradas.'}

USO DE FERRAMENTAS:
- Você tem ferramentas conectadas para:
  1. consultar_servicos (pesquisar catálogo com descrições e valores)
  2. consultar_horarios_livres (verificar horários na agenda para uma data YYYY-MM-DD)
  3. agendar_horario (confirmar e reservar uma reunião após o cliente concordar com o horário)
  4. enviar_email_confirmacao (enviar e-mail com detalhes ao cliente)
  5. adicionar_contato_crm (armazenar o lead na planilha Google Sheets / CRM)
  6. notificar_equipe_slack (avisar a equipe de plantão sobre lead qualificado ou agendamento)
  7. transferir_para_humano (passar o atendimento para a equipe humana quando solicitado ou em caso de urgência/reclamação)
- Sempre que o cliente perguntar por datas ou disponibilidade, chame "consultar_horarios_livres" com a data correta.
- Se o cliente confirmar um horário e fornecer nome e telefone, chame "agendar_horario" e opcionalmente "enviar_email_confirmacao" ou "adicionar_contato_crm".
- Se o cliente solicitar expressamente falar com um atendente humano ou se houver reclamação séria, acione "transferir_para_humano".
- Seja sempre cortês, profissional e represente a marca com excelência!`;
}

/**
 * Call OpenRouter with a specific model and tools
 */
async function callOpenRouter(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  appUrl: string
) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': appUrl,
      'X-Title': 'Atende AI'
    },
    body: JSON.stringify({
      model,
      messages,
      tools: AVAILABLE_TOOLS,
      tool_choice: 'auto',
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter Error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

/**
 * Execute a conversation turn with OpenRouter and recursive Tool Calling
 */
export async function runAssistantEngine(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  safeMode?: boolean;
  channel?: 'whatsapp' | 'web';
  conversationId?: string;
}): Promise<EngineResult> {
  const { messages: rawMessages, channel = 'web', conversationId } = params;

  // Retrieve assistant config
  const config = await prisma.assistantConfig.findFirst();
  const safeMode = params.safeMode !== undefined ? params.safeMode : (config?.safeMode ?? false);
  let selectedModel = config?.modelSelected || DEFAULT_MODEL;

  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!apiKey || apiKey === 'sua_chave_openrouter_aqui') {
    // Intelligent contextual engine when OpenRouter API key is not configured
    const rawLastText = rawMessages[rawMessages.length - 1]?.content || '';
    const userText = rawLastText.toLowerCase().trim();
    const prevAssistantText =
      [...rawMessages]
        .reverse()
        .find((m) => m.role === 'assistant')
        ?.content?.toLowerCase() || '';

    const steps: ToolExecutionResult[] = [];
    const toolsUsed: string[] = [];
    let text = '';
    let escalated = false;

    const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const tomorrowFormatted = new Date(Date.now() + 86400000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });

    // Helper: check if user is finishing/thanking ("só isso", "obrigado", "não", "tudo certo", "valeu", "ok")
    const isClosingOrThanks =
      /^(s[oó]\s*isso|era\s*s[oó]\s*isso|mais\s*nada|nada\s*n[aã]o|n[aã]o(\s*obrigad[oa])?|n[aã]o\s*precisa|obrigad[oa]|valeu|tudo\s*certo|perfeito|combinado|fechado|beleza|ok|t[aá]\s*[oó]timo|at[eé]\s*mais|at[eé]\s*amanh[aã]|tchau)\b/i.test(
        userText
      ) ||
      userText.includes('só isso') ||
      userText.includes('so isso') ||
      userText.includes('obrigado') ||
      userText.includes('obrigada') ||
      userText.includes('agradecido') ||
      userText.includes('mais nada');

    const justBookedInPrevTurn =
      prevAssistantText.includes('reservei sua') ||
      prevAssistantText.includes('detalhe específico do seu negócio') ||
      prevAssistantText.includes('agendei com sucesso');

    // 0. Closing / Thank you intent or Post-Booking follow-up
    if (isClosingOrThanks) {
      if (justBookedInPrevTurn) {
        text = `Combinado! Tudo confirmado na agenda então 📅✨\n\nNossa equipe da *AndradeStudio* já recebeu os dados e te aguarda no horário marcado. Qualquer dúvida até lá, é só mandar mensagem por aqui. Muito obrigado e até breve! 🚀`;
      } else {
        text = `Por nada! Foi um prazer te atender na *AndradeStudio* 🚀\n\nSempre que precisar criar um site, aplicativo ou colocar um Agente de IA na sua operação, é só chamar por aqui. Tenha um excelente dia!`;
      }
    } else if (
      justBookedInPrevTurn &&
      !userText.includes('preço') &&
      !userText.includes('quanto') &&
      !userText.includes('humano')
    ) {
      // User shared details about their business right after booking the demo
      toolsUsed.push('adicionar_contato_crm');
      const crmStep = await executeTool(
        'adicionar_contato_crm',
        {
          nome: 'Cliente AndradeStudio',
          telefone: '+55 11 98888-7777',
          canal: channel,
          interesse: `Observação para reunião: ${rawLastText}`,
          pediu_agendamento: true
        },
        { safeMode, channel, conversationId }
      );
      steps.push(crmStep);

      text = `Anotado! Já registrei esses detalhes no nosso CRM para o especialista preparar uma demonstração 100% focada no seu cenário 📝✨\n\nNos vemos na reunião! Se precisar de mais alguma coisa até lá, estou à disposição.`;
    }
    // 1. Human handover intent
    else if (
      userText.includes('humano') ||
      userText.includes('atendente') ||
      userText.includes('pessoa') ||
      userText.includes('urgente') ||
      userText.includes('reclama') ||
      userText.includes('falar com eduardo')
    ) {
      toolsUsed.push('transferir_para_humano');
      escalated = true;
      const step = await executeTool(
        'transferir_para_humano',
        {
          motivo: 'Solicitação direta do cliente para falar com especialista',
          resumo: rawLastText
        },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      toolsUsed.push('notificar_equipe_slack');
      const slackStep = await executeTool(
        'notificar_equipe_slack',
        {
          mensagem: `Cliente solicitou atendimento humano no canal ${channel}: "${rawLastText}"`,
          urgencia: 'alta'
        },
        { safeMode, channel, conversationId }
      );
      steps.push(slackStep);

      text = `Entendido! Já acionei nossa equipe técnica da *AndradeStudio* e transferi seu atendimento com prioridade máxima 🔴\n\nUm especialista humano assumirá esta conversa em instantes. Se quiser, já pode adiantar seu nome e o resumo da sua demanda!`;
    }
    // 2. Specific time slot chosen or booking confirmation
    else if (
      userText.includes('09:30') ||
      userText.includes('9:30') ||
      userText.includes('11:00') ||
      userText.includes('14:30') ||
      userText.includes('14h') ||
      userText.includes('16:00') ||
      userText.includes('16h') ||
      userText.includes('17:15') ||
      ((prevAssistantText.includes('horários livres') ||
        prevAssistantText.includes('horários disponíveis') ||
        prevAssistantText.includes('qual desses horários') ||
        prevAssistantText.includes('qual horário')) &&
        /\b(9|11|14|16|17)\b/.test(userText))
    ) {
      const chosenSlot =
        userText.includes('09:30') || userText.includes('9')
          ? '09:30'
          : userText.includes('11')
          ? '11:00'
          : userText.includes('16')
          ? '16:00'
          : userText.includes('17')
          ? '17:15'
          : '14:30';

      toolsUsed.push('consultar_horarios_livres');
      const checkStep = await executeTool(
        'consultar_horarios_livres',
        { data: tomorrowDate, servico: 'Reunião de Diagnóstico e Demonstração de IA' },
        { safeMode, channel, conversationId }
      );
      steps.push(checkStep);

      toolsUsed.push('agendar_horario');
      const bookStep = await executeTool(
        'agendar_horario',
        {
          nome_cliente: 'Cliente AndradeStudio',
          telefone_cliente: '+55 11 98888-7777',
          email_cliente: 'contato@cliente.com.br',
          data_hora: `${tomorrowDate}T${chosenSlot}:00`,
          servico: 'Reunião de Diagnóstico e Demonstração de IA'
        },
        { safeMode, channel, conversationId }
      );
      steps.push(bookStep);

      toolsUsed.push('adicionar_contato_crm');
      const crmStep = await executeTool(
        'adicionar_contato_crm',
        {
          nome: 'Cliente AndradeStudio',
          telefone: '+55 11 98888-7777',
          canal: channel,
          interesse: 'Diagnóstico de IA & Soluções Digitais',
          pediu_agendamento: true
        },
        { safeMode, channel, conversationId }
      );
      steps.push(crmStep);

      text = `Perfeito! ${
        safeMode ? '*(Simulado em Modo Seguro)* ' : ''
      }Reservei sua *Reunião de Diagnóstico de IA* na agenda da *AndradeStudio* para amanhã (${tomorrowFormatted}) às *${chosenSlot}*! 📅✨\n\nVocê receberá o link do Google Meet por WhatsApp e e-mail. Tem algum detalhe específico do seu negócio que você gostaria que nossa equipe preparasse para a demonstração?`;
    }
    // 3. Asking to schedule / check calendar availability
    else if (
      userText.includes('agendar') ||
      userText.includes('horário') ||
      userText.includes('horario') ||
      userText.includes('marcar') ||
      userText.includes('amanhã') ||
      userText.includes('amanha') ||
      userText.includes('reunião') ||
      userText.includes('reuniao') ||
      userText.includes('diagnóstico') ||
      userText.includes('diagnostico') ||
      userText.includes('demonstração') ||
      userText.includes('demonstracao') ||
      userText.includes('call')
    ) {
      toolsUsed.push('consultar_horarios_livres');
      const step = await executeTool(
        'consultar_horarios_livres',
        { data: tomorrowDate },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Consultei nossa agenda oficial do Google Calendar para amanhã (${tomorrowFormatted}) e temos estes horários livres para a *Reunião de Diagnóstico Gratuita (30 min)*:\n\n• *09:30*\n• *11:00*\n• *14:30*\n• *16:00*\n• *17:15*\n\nQual desses horários fica melhor para você? Basta me responder com o horário de preferência!`;
    }
    // 4. Asking how to get an AI Agent / Chatbot / WhatsApp automation
    else if (
      userText.includes('agente') ||
      userText.includes('chatbot') ||
      userText.includes('bot') ||
      userText.includes('whatsapp') ||
      userText.includes('ia') ||
      userText.includes('inteligência artificial') ||
      userText.includes('inteligencia artificial') ||
      userText.includes('como funciona') ||
      userText.includes('como ter') ||
      userText.includes('como eu tenho') ||
      userText.includes('quero ter')
    ) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool(
        'consultar_servicos',
        { busca: 'Agente de IA' },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Ter um *Agente de IA oficial da AndradeStudio* na sua empresa é super simples! Nós cuidamos de toda a implementação em *3 passos rápidos*:\n\n1. *Diagnóstico & Mapeamento (Gratuito):* Entendemos seus produtos/serviços, preços, regras de negócio e o tom de voz da sua marca.\n2. *Treinamento & Integrações:* Configuramos sua IA conectada ao seu catálogo, Google Calendar (para agendar sozinho), CRM/Planilhas e regras de transbordo para humano.\n3. *Ativação no WhatsApp e Site:* Você escaneia o QR Code no painel e o agente passa a atender seus clientes em menos de 2 segundos, 24h por dia!\n\n💡 *Investimento:* A implantação completa do Agente de IA para WhatsApp & Site parte de *R$ 2.400,00* (com painel administrativo incluso para você gerenciar tudo sem programar).\n\nQuer agendar uma *Reunião de Diagnóstico Gratuita de 30 min* para vermos como ele funcionaria no seu negócio?`;
    }
    // 5. Asking about Websites / Landing Pages
    else if (
      userText.includes('site') ||
      userText.includes('landing') ||
      userText.includes('página') ||
      userText.includes('pagina') ||
      userText.includes('institucional')
    ) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool(
        'consultar_servicos',
        { busca: 'Site' },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Na *AndradeStudio*, criamos sites e landing pages com visual cinematográfico de alto impacto — feitos para posicionar sua marca acima da concorrência e converter visitantes em clientes:\n\n• *Landing Page & Site Institucional com IA:* a partir de *R$ 1.950,00*\n• *Prazo médio de entrega:* 5 a 10 dias úteis\n• *Incluso:* Design responsivo premium, alta velocidade, SEO otimizado, integração com WhatsApp e widget de IA 24h.\n\nVocê já tem uma referência de estilo ou gostaria de agendar um diagnóstico rápido de 30 minutos para desenharmos a proposta do seu site?`;
    }
    // 6. Asking about Apps / SaaS / Custom Software
    else if (
      userText.includes('app') ||
      userText.includes('aplicativo') ||
      userText.includes('saas') ||
      userText.includes('sistema') ||
      userText.includes('plataforma') ||
      userText.includes('mobile') ||
      userText.includes('software')
    ) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool(
        'consultar_servicos',
        { busca: 'Aplicativo' },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Desenvolvemos aplicativos sob medida com arquitetura moderna (Next.js, React Native, Node.js e IA integrada):\n\n• *Aplicativo Web Sob Medida (SaaS / Painel):* a partir de *R$ 4.900,00*\n• *Aplicativo Mobile (iOS & Android):* a partir de *R$ 7.800,00*\n\nTodos os sistemas incluem painel administrativo, autenticação segura, banco de dados em nuvem e integração com pagamentos (Stripe/PIX).\n\nQuer agendar uma conversa técnica gratuita de 30 minutos para avaliarmos o escopo do seu aplicativo?`;
    }
    // 7. Asking about Automation / n8n / Make / CRM
    else if (
      userText.includes('automa') ||
      userText.includes('n8n') ||
      userText.includes('make') ||
      userText.includes('planilha') ||
      userText.includes('crm') ||
      userText.includes('processo')
    ) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool(
        'consultar_servicos',
        { busca: 'Automação' },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Nossas *Automações Inteligentes com IA* conectam as ferramentas que sua empresa já usa (WhatsApp, Google Sheets, Gmail, Slack, CRM e Stripe) para eliminar trabalho manual:\n\n• *Automação de Processos Empresariais (n8n / Make / Webhooks):* a partir de *R$ 1.800,00*\n\nQual tarefa repetitiva mais consome tempo da sua equipe hoje? Se quiser, podemos mapear esse fluxo juntos em uma call gratuita de 30 minutos!`;
    }
    // 8. General catalog / prices / services
    else if (
      userText.includes('serviço') ||
      userText.includes('servico') ||
      userText.includes('preço') ||
      userText.includes('preco') ||
      userText.includes('valor') ||
      userText.includes('custa') ||
      userText.includes('quanto') ||
      userText.includes('orçamento') ||
      userText.includes('orcamento') ||
      userText.includes('oferecem') ||
      userText.includes('soluções') ||
      userText.includes('solucoes') ||
      userText.includes('catálogo') ||
      userText.includes('catalogo')
    ) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool('consultar_servicos', {}, { safeMode, channel, conversationId });
      steps.push(step);
      const servicos = (step.output as any[]) || [];
      const listaFormatada = servicos
        .slice(0, 5)
        .map(
          (s) =>
            `• *${s.nome}*: ${
              s.preco === 0
                ? 'Gratuito'
                : `R$ ${s.preco.toFixed(2)}${s.precoAPartirDe ? ' (a partir de)' : ''}`
            }`
        )
        .join('\n');

      text = `Na *AndradeStudio*, criamos presenças digitais premium e automações com IA para empresas que querem vender mais e atender com máxima eficiência. Confira nossas principais soluções:\n\n${listaFormatada}\n\nQual dessas frentes faz mais sentido para o momento da sua empresa? Posso detalhar qualquer uma delas ou verificar nossos horários livres para uma demonstração!`;
    }
    // 9. FAQs (payment methods, deadlines, warranty, NDA)
    else if (
      userText.includes('pagamento') ||
      userText.includes('parcela') ||
      userText.includes('cartão') ||
      userText.includes('cartao') ||
      userText.includes('pix') ||
      userText.includes('prazo') ||
      userText.includes('demora') ||
      userText.includes('garantia') ||
      userText.includes('suporte') ||
      userText.includes('contrato')
    ) {
      const faqs = await prisma.faq.findMany();
      const matchedFaq = faqs.find(
        (f) =>
          f.question.toLowerCase().includes(userText) ||
          userText
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .some((w) => f.question.toLowerCase().includes(w) || f.answer.toLowerCase().includes(w))
      );

      if (matchedFaq) {
        text = `Excelente pergunta! 💡\n\n*${matchedFaq.question}*\n${matchedFaq.answer}\n\nFicou alguma dúvida sobre esse ponto ou gostaria de agendar um bate-papo rápido para estruturarmos seu projeto?`;
      } else {
        text = `Trabalhamos com condições super flexíveis: parcelamento por etapas de entrega, PIX com desconto ou em até 12x no cartão corporativo, sempre com contrato formal, NDA e 30 dias de garantia técnica integral.\n\nGostaria de agendar uma reunião rápida de 30 minutos para montarmos um orçamento sob medida para você?`;
      }
    }
    // 10. Positive confirmation ("sim", "quero", "vamos", "bora", "pode ser")
    else if (
      userText === 'sim' ||
      userText.startsWith('sim ') ||
      userText.includes('quero') ||
      userText.includes('pode ser') ||
      userText.includes('vamos') ||
      userText.includes('bora') ||
      userText.includes('com certeza') ||
      userText.includes('claro')
    ) {
      toolsUsed.push('consultar_horarios_livres');
      const step = await executeTool(
        'consultar_horarios_livres',
        { data: tomorrowDate },
        { safeMode, channel, conversationId }
      );
      steps.push(step);

      text = `Excelente! 🚀 Consultei a agenda da *AndradeStudio* para amanhã (${tomorrowFormatted}) e temos os seguintes horários disponíveis para nossa sessão de diagnóstico:\n\n• *09:30*\n• *11:00*\n• *14:30*\n• *16:00*\n• *17:15*\n\nQual horário funciona melhor para você?`;
    }
    // 11. Greeting or open-ended message
    else if (
      userText.includes('olá') ||
      userText.includes('ola') ||
      userText === 'oi' ||
      userText.startsWith('oi ') ||
      userText.includes('bom dia') ||
      userText.includes('boa tarde') ||
      userText.includes('boa noite')
    ) {
      text = `Olá! Seja muito bem-vindo(a) à *AndradeStudio* 🚀\n\nSou o assistente virtual oficial da agência. Nós criamos *Sites Premium*, *Aplicativos Sob Medida* e *Agentes de IA para WhatsApp & Web*.\n\nMe conta: qual projeto ou necessidade você quer tirar do papel hoje?`;
    } else {
      // Contextual consultative reply for any other message
      toolsUsed.push('consultar_servicos');
      const step = await executeTool('consultar_servicos', {}, { safeMode, channel, conversationId });
      steps.push(step);

      text = `Entendi! Na *AndradeStudio*, desenhamos soluções personalizadas para esse cenário combinando:\n\n• *Agentes de IA 24/7 no WhatsApp & Site* (a partir de R$ 2.400)\n• *Sites & Landing Pages de Alta Conversão* (a partir de R$ 1.950)\n• *Aplicativos Web/Mobile & Automações* (a partir de R$ 1.800)\n\nPara eu te direcionar melhor: você prefere *ver como funciona o Agente de IA*, *orçar um site/aplicativo* ou *agendar uma demonstração gratuita*?`;
    }

    return {
      text,
      steps,
      toolsUsed,
      modelUsed: 'andrade-ai/contextual-engine',
      escalated
    };
  }

  const systemPrompt = await buildSystemPrompt();

  const conversationHistory: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...rawMessages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  ];

  const executionSteps: ToolExecutionResult[] = [];
  const toolsUsedSet = new Set<string>();
  let hasEscalated = false;
  let activeModel = selectedModel;
  let finalAssistantMessage = '';

  // Max 5 turns of tool execution to prevent infinite loops
  const MAX_TOOL_TURNS = 5;

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    let completionData: any;

    try {
      completionData = await callOpenRouter(activeModel, conversationHistory, apiKey, appUrl);
    } catch (primaryErr: any) {
      console.warn(`[OpenRouter] Falha com modelo ${activeModel}: ${primaryErr.message}`);

      // If active model failed and it was not already the default model, fallback to DEFAULT_MODEL once
      if (activeModel !== DEFAULT_MODEL) {
        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'openrouter',
            action: 'model_fallback',
            details: {
              failedModel: activeModel,
              fallbackModel: DEFAULT_MODEL,
              error: primaryErr.message
            },
            result: 'error'
          }
        });

        activeModel = DEFAULT_MODEL;
        try {
          completionData = await callOpenRouter(activeModel, conversationHistory, apiKey, appUrl);
        } catch (fallbackErr: any) {
          throw new Error(`Erro ao conectar com OpenRouter: ${fallbackErr.message}`);
        }
      } else {
        throw primaryErr;
      }
    }

    const choice = completionData?.choices?.[0];
    const message = choice?.message;

    if (!message) {
      throw new Error('Nenhuma resposta retornada pelo modelo de IA.');
    }

    // Check if the model decided to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Append assistant's tool-call intent to conversation history
      conversationHistory.push({
        role: 'assistant',
        content: message.content || null,
        tool_calls: message.tool_calls
      });

      // Execute each tool call sequentially
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        let parsedArgs: any = {};
        try {
          parsedArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          parsedArgs = {};
        }

        toolsUsedSet.add(functionName);
        if (functionName === 'transferir_para_humano') {
          hasEscalated = true;
        }

        const stepResult = await executeTool(functionName, parsedArgs, {
          safeMode,
          channel,
          conversationId
        });

        executionSteps.push(stepResult);

        // Append the tool result back to the conversation
        conversationHistory.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(stepResult.output)
        });
      }

      // Continue loop to let model formulate answer based on tool results
      continue;
    }

    // No more tools called, we have the final textual response
    finalAssistantMessage = message.content || '';
    break;
  }

  return {
    text: finalAssistantMessage,
    steps: executionSteps,
    toolsUsed: Array.from(toolsUsedSet),
    modelUsed: activeModel,
    escalated: hasEscalated
  };
}
