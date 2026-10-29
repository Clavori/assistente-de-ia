import { prisma } from '../prisma';
import { AVAILABLE_TOOLS, executeTool, ToolExecutionResult } from './tools';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_OPENAI_COMPAT_URL = 'https://text.pollinations.ai/openai';
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
export async function buildSystemPrompt(extraToolContext?: string): Promise<string> {
  const [business, config, services, faqs] = await Promise.all([
    prisma.business.findFirst(),
    prisma.assistantConfig.findFirst(),
    prisma.service.findMany({ orderBy: { price: 'asc' } }),
    prisma.faq.findMany({ take: 15 })
  ]);

  const businessName = business?.name || 'AndradeStudio AI';
  const activity =
    business?.activity || 'Desenvolvimento de Sites, Aplicativos Web/Mobile e Automações com IA';
  const phone = business?.phone || '+55 11 98765-4321';
  const address = business?.address || 'São Paulo - SP • Atendimento em todo o Brasil';
  const website = business?.website || 'https://andrade-studio.vercel.app';
  const timeZone = business?.timeZone || 'America/Sao_Paulo';

  const assistantName = config?.name || 'Andrade AI';
  const tone = config?.tone || 'cercano';
  const instructions =
    config?.instructions ||
    'Você é um consultor humano, atencioso e prestativo da AndradeStudio AI.';
  const neverDoRules = (config?.neverDoRules as string[]) || [];

  const servicesList = services
    .map(
      (s) =>
        `- ${s.name}: R$ ${Number(s.price || 0).toFixed(2)}${s.priceFrom ? ' (a partir de)' : ''} | Duração: ${s.durationMinutes} min. Descrição: ${s.description || 'N/A'}`
    )
    .join('\n');

  const faqsList = faqs.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');

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

  return `Você é "${assistantName}", consultor de atendimento oficial da "${businessName}".
Empresa: ${businessName}
Ramo de Atuação: ${activity}
Localização: ${address}
Telefone / WhatsApp: ${phone}
Site oficial: ${website}
Data e hora atual: ${currentDate}, às ${currentTime}.

COMO VOCÊ DEVE CONVERSAR (ESTILO HUMANO REAL NO WHATSAPP):
1. Converse exatamente como uma pessoa real, empática, inteligente e natural no WhatsApp.
2. Responda DIRETAMENTE ao que o cliente acabou de falar! Se ele contar o ramo dele (ex: barbearia, clínica, loja, advocacia), comente especificamente sobre como podemos ajudar o negócio dele. Se ele fizer uma pergunta específica, responda na mosca sem enrolação.
3. Escreva mensagens curtas, leves e fluidas (1 a 3 parágrafos curtos), como um consultor humano digitando no WhatsApp. Evite listas gigantescas se o cliente não pediu um catálogo.
4. No primeiro "oi" / "olá" / "bom dia", dê boas-vindas em nome da *AndradeStudio AI* 🚀 e pergunte de forma amigável como pode ajudar hoje. Nos turnos seguintes da conversa, NÃO repita "Olá! Seja bem-vindo à AndradeStudio AI" — apenas continue o papo naturalmente!
5. Só cite preços se o cliente perguntar valores ou pedir orçamento.
6. Use negrito do WhatsApp (*texto*) com moderação apenas para destacar pontos importantes.

INSTRUÇÕES DO NEGÓCIO:
${instructions}

REGRAS QUE VOCÊ NUNCA DEVE FAZER:
${neverDoRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

CATÁLOGO DE SERVIÇOS E PREÇOS OFICIAIS DA ANDRADESTUDIO AI:
${servicesList}

PERGUNTAS FREQUENTES (FAQs):
${faqsList}
${extraToolContext ? `\nADOS EXECUTADOS NO SISTEMA NESTE TURNO (USE NA SUA RESPOSTA):\n${extraToolContext}` : ''}`;
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
      'X-Title': 'AndradeStudio AI'
    },
    body: JSON.stringify({
      model,
      messages,
      tools: AVAILABLE_TOOLS,
      tool_choice: 'auto',
      temperature: 0.5
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter Error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

/**
 * Build a concise, fast system prompt for natural human WhatsApp conversation
 */
async function buildCompactHumanPrompt(extraToolContext?: string): Promise<string> {
  const [business, config] = await Promise.all([
    prisma.business.findFirst(),
    prisma.assistantConfig.findFirst()
  ]);

  const businessName = business?.name || 'AndradeStudio AI';
  const assistantName = config?.name || 'Andrade AI';

  return `Você é ${assistantName}, consultor humano oficial da agência *${businessName}* no WhatsApp.
O que a *${businessName}* faz:
- *Agente de IA para WhatsApp & Site (Atendimento e Agendamento 24/7)*: a partir de R$ 2.400
- *Sites & Landing Pages Premium de Alta Conversão*: a partir de R$ 1.950 (entrega em 5 a 10 dias úteis)
- *Aplicativos Web/SaaS Sob Medida*: a partir de R$ 4.900
- *Aplicativos Mobile (iOS e Android)*: a partir de R$ 7.800
- *Automações Empresariais (n8n, Make, CRM, Google Sheets)*: a partir de R$ 1.800
- *Reunião de Diagnóstico e Demonstração Online (30 min)*: 100% Gratuita!
- Pagamento: PIX com desconto, parcelado por etapas ou até 12x no cartão. Garantia de 30 dias + Contrato NDA.

Regras de ouro da sua conversa:
1. Converse exatamente como um consultor humano brasileiro, simpático, direto e natural no WhatsApp.
2. Responda especificamente ao que o cliente acabou de dizer (mencione o negócio dele, a dúvida dele ou o comentário que ele fez).
3. Use mensagens curtas (1 a 3 parágrafos curtos). Só fale preços se o cliente perguntar valores.
4. No primeiro "oi/olá", dê boas-vindas à *${businessName}* 🚀. Nas mensagens seguintes da conversa, NÃO repita boas-vindas, apenas continue o papo naturalmente!
${extraToolContext ? `\nInformação importante do sistema neste turno: ${extraToolContext}` : ''}`;
}

/**
 * Call the built-in free OpenAI-compatible LLM so the assistant always converses like a real human
 * even when no external OPENROUTER_API_KEY is configured.
 */
async function callBuiltInHumanLLM(messages: ChatMessage[]): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(FREE_OPENAI_COMPAT_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai',
        messages: messages.map((m) => ({
          role: m.role === 'tool' ? 'system' : m.role,
          content: m.content || ''
        }))
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim().replace(/\*\*([^*]+)\*\*/g, '*$1*');
    }
    return null;
  } catch (err: any) {
    console.warn('[BuiltIn Human LLM Warning]:', err.message);
    return null;
  }
}

/**
 * Execute a conversation turn with real LLM + automatic tool execution
 */
export async function runAssistantEngine(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  safeMode?: boolean;
  channel?: 'whatsapp' | 'web';
  conversationId?: string;
}): Promise<EngineResult> {
  const { messages: rawMessages, channel = 'web', conversationId } = params;

  const config = await prisma.assistantConfig.findFirst();
  const safeMode = params.safeMode !== undefined ? params.safeMode : (config?.safeMode ?? false);
  const selectedModel = config?.modelSelected || DEFAULT_MODEL;

  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  // If user configured their own OpenRouter API Key, use OpenRouter with full tool calling
  if (apiKey && apiKey !== 'sua_chave_openrouter_aqui') {
    try {
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

      for (let turn = 0; turn < 5; turn++) {
        let completionData: any;
        try {
          completionData = await callOpenRouter(activeModel, conversationHistory, apiKey, appUrl);
        } catch (primaryErr: any) {
          if (activeModel !== DEFAULT_MODEL) {
            activeModel = DEFAULT_MODEL;
            completionData = await callOpenRouter(activeModel, conversationHistory, apiKey, appUrl);
          } else {
            throw primaryErr;
          }
        }

        const choice = completionData?.choices?.[0];
        const message = choice?.message;
        if (!message) break;

        if (message.tool_calls && message.tool_calls.length > 0) {
          conversationHistory.push({
            role: 'assistant',
            content: message.content || null,
            tool_calls: message.tool_calls
          });

          for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name;
            let parsedArgs: any = {};
            try {
              parsedArgs = JSON.parse(toolCall.function.arguments || '{}');
            } catch {}

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

            conversationHistory.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: functionName,
              content: JSON.stringify(stepResult.output)
            });
          }
          continue;
        }

        finalAssistantMessage = message.content || '';
        break;
      }

      if (finalAssistantMessage) {
        return {
          text: finalAssistantMessage,
          steps: executionSteps,
          toolsUsed: Array.from(toolsUsedSet),
          modelUsed: activeModel,
          escalated: hasEscalated
        };
      }
    } catch (err: any) {
      console.warn('[OpenRouter fallback to BuiltIn LLM]:', err.message);
    }
  }

  // Automatic Tool Detection + Real Conversational Human LLM (no API key required!)
  const rawLastText = rawMessages[rawMessages.length - 1]?.content || '';
  const userText = rawLastText.toLowerCase().trim();
  const prevAssistantText =
    [...rawMessages]
      .reverse()
      .find((m) => m.role === 'assistant')
      ?.content?.toLowerCase() || '';

  const steps: ToolExecutionResult[] = [];
  const toolsUsed: string[] = [];
  let escalated = false;
  let toolContextForLLM = '';

  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const tomorrowFormatted = new Date(Date.now() + 86400000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });

  // 1. Check if user is asking for a human specialist
  if (
    userText.includes('humano') ||
    userText.includes('atendente') ||
    userText.includes('falar com alguém') ||
    userText.includes('falar com alguem') ||
    userText.includes('falar com eduardo') ||
    userText.includes('reclama')
  ) {
    toolsUsed.push('transferir_para_humano');
    escalated = true;
    const step = await executeTool(
      'transferir_para_humano',
      {
        motivo: 'Solicitação do cliente durante a conversa',
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
    toolContextForLLM = `A conversa foi transferida com sucesso para um especialista humano da AndradeStudio AI. Avise o cliente com simpatia que nossa equipe já foi acionada e assumirá o atendimento em instantes.`;
  }
  // 2. Check if user picked a time slot to book a meeting
  else if (
    userText.includes('09:30') ||
    userText.includes('9:30') ||
    userText.includes('11:00') ||
    userText.includes('14:30') ||
    userText.includes('14h') ||
    userText.includes('16:00') ||
    userText.includes('16h') ||
    userText.includes('17:15') ||
    ((prevAssistantText.includes('horários') || prevAssistantText.includes('horarios')) &&
      /\b(9|10|11|14|15|16|17)\b/.test(userText))
  ) {
    const chosenSlot =
      userText.includes('09:30') || userText.includes('9')
        ? '09:30'
        : userText.includes('10')
        ? '10:00'
        : userText.includes('11')
        ? '11:00'
        : userText.includes('15')
        ? '15:00'
        : userText.includes('16')
        ? '16:00'
        : userText.includes('17')
        ? '17:15'
        : '14:30';

    toolsUsed.push('agendar_horario');
    const bookStep = await executeTool(
      'agendar_horario',
      {
        nome_cliente: 'Cliente AndradeStudio AI',
        telefone_cliente: '+55 11 98888-7777',
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
        nome: 'Cliente AndradeStudio AI',
        telefone: '+55 11 98888-7777',
        canal: channel,
        interesse: 'Diagnóstico de IA & Soluções Digitais',
        pediu_agendamento: true
      },
      { safeMode, channel, conversationId }
    );
    steps.push(crmStep);

    toolContextForLLM = `Acabamos de confirmar e gravar na agenda do Google Calendar a reunião para amanhã (${tomorrowFormatted}) às ${chosenSlot} (${JSON.stringify(bookStep.output)}). Confirme para o cliente de forma calorosa e natural que está agendado!`;
  }
  // 3. Check if user is asking to schedule or check available times
  else if (
    userText.includes('agendar') ||
    userText.includes('horário') ||
    userText.includes('horario') ||
    userText.includes('marcar') ||
    userText.includes('reunião') ||
    userText.includes('reuniao') ||
    userText.includes('call') ||
    userText.includes('demonstração') ||
    userText.includes('demonstracao')
  ) {
    toolsUsed.push('consultar_horarios_livres');
    const step = await executeTool(
      'consultar_horarios_livres',
      { data: tomorrowDate },
      { safeMode, channel, conversationId }
    );
    steps.push(step);
    const slots = (step.output as any)?.horariosDisponiveis || ['09:30', '11:00', '14:30', '16:00'];
    toolContextForLLM = `Consultamos o Google Calendar para amanhã (${tomorrowFormatted}) e os horários livres são: ${slots.join(', ')}. Apresente essas opções naturalmente ao cliente e pergunte qual horário fica melhor para ele.`;
  }

  // Call the real conversational LLM with full conversation history!
  const compactPrompt = await buildCompactHumanPrompt(toolContextForLLM);
  const llmMessages: ChatMessage[] = [
    { role: 'system', content: compactPrompt },
    ...rawMessages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content
    }))
  ];

  const humanReply = await callBuiltInHumanLLM(llmMessages);
  if (humanReply) {
    return {
      text: humanReply,
      steps,
      toolsUsed,
      modelUsed: 'openai/gpt-4o-mini (Conversação Natural)',
      escalated
    };
  }

  // Offline / Fallback response if internet to LLM is unreachable
  const fallbackText =
    rawMessages.length <= 1
      ? `Olá! Seja muito bem-vindo(a) à *AndradeStudio AI* 🚀\n\nSou o consultor virtual da agência. Criamos *Sites Premium*, *Aplicativos Sob Medida* e *Agentes de IA para WhatsApp & Web*.\n\nMe conta: qual projeto ou ideia você quer tirar do papel hoje?`
      : `Perfeito! Na *AndradeStudio AI* nós personalizamos toda a solução para o cenário do seu negócio — desde sites e aplicativos até agentes de IA que atendem e agendam sozinhos no WhatsApp.\n\nComo posso te ajudar nesse próximo passo? Quer ver como funciona na prática ou prefere agendar um bate-papo rápido?`;

  return {
    text: fallbackText,
    steps,
    toolsUsed,
    modelUsed: 'andrade-ai/contextual-engine',
    escalated
  };
}
