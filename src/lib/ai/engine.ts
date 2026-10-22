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
    // Intelligent local fallback when API key is not yet set
    const userText = rawMessages[rawMessages.length - 1]?.content.toLowerCase() || '';
    const steps: ToolExecutionResult[] = [];
    const toolsUsed: string[] = [];
    let text = '';
    let escalated = false;

    if (userText.includes('serviço') || userText.includes('preço') || userText.includes('valor') || userText.includes('custa') || userText.includes('oferecem')) {
      toolsUsed.push('consultar_servicos');
      const step = await executeTool('consultar_servicos', {}, { safeMode, channel, conversationId });
      steps.push(step);
      const servicos = step.output as any[];
      const listaFormatada = servicos
        .slice(0, 4)
        .map((s) => `• *${s.nome}*: R$ ${s.preco.toFixed(2)}${s.precoAPartirDe ? ' (a partir de)' : ''}`)
        .join('\n');

      text = `Com certeza! Na *Andrade Studio AI*, somos especialistas em soluções de tecnologia e IA. Aqui estão alguns dos nossos principais serviços:\n\n${listaFormatada}\n\nAlém disso, oferecemos nossa *Reunião de Diagnóstico de IA* totalmente gratuita de 30 minutos. Gostaria de verificar os horários disponíveis para agendar uma demonstração?`;
    } else if (userText.includes('agendar') || userText.includes('horário') || userText.includes('marcar') || userText.includes('amanhã') || userText.includes('reunião')) {
      toolsUsed.push('consultar_horarios_livres');
      const step = await executeTool('consultar_horarios_livres', { data: '2026-10-23' }, { safeMode, channel, conversationId });
      steps.push(step);

      if (userText.includes('14:30') || userText.includes('11:00') || userText.includes('09:30')) {
        toolsUsed.push('agendar_horario');
        const bookStep = await executeTool('agendar_horario', {
          nome_cliente: 'Cliente Demonstração',
          telefone_cliente: '+55 11 98888-7777',
          email_cliente: 'contato@cliente.com',
          data_hora: '2026-10-23T14:30:00',
          servico: 'Reunião de Diagnóstico e Demonstração de IA'
        }, { safeMode, channel, conversationId });
        steps.push(bookStep);

        text = `Perfeito! ${safeMode ? '[Modo Seguro Ativo] ' : ''}Agendei com sucesso sua *Reunião de Diagnóstico de IA* para amanhã às 14:30 com nosso especialista! 📅✨\n\nEnviaremos uma confirmação com o link do Google Meet por e-mail e WhatsApp. Há mais alguma dúvida em que eu possa te ajudar?`;
      } else {
        text = `Temos os seguintes horários livres disponíveis para amanhã na agenda:\n\n• 09:30\n• 11:00\n• 14:30\n• 16:00\n• 17:15\n\nQual desses horários fica melhor para você? Basta me dizer seu nome e o horário de sua preferência!`;
      }
    } else if (userText.includes('humano') || userText.includes('atendente') || userText.includes('pessoa') || userText.includes('urgente')) {
      toolsUsed.push('transferir_para_humano');
      escalated = true;
      const step = await executeTool('transferir_para_humano', {
        motivo: 'Solicitação direta do cliente',
        resumo: userText
      }, { safeMode, channel, conversationId });
      steps.push(step);

      text = `Entendido! Estou transferindo seu atendimento imediatamente para um de nossos especialistas humanos da equipe técnica da Andrade Studio AI. Em instantes um operador continuará a conversa por aqui. Por favor, aguarde um momento! 👨‍💻`;
    } else {
      text = `Olá! Sou o assistente de IA da *Andrade Studio AI* 🚀\n\nDesenvolvemos sites modernos de alta performance, aplicativos web/mobile sob medida e agentes inteligentes com IA para empresas.\n\nComo posso ajudar o seu projeto hoje? Se quiser, você pode perguntar sobre nossos serviços, preços ou agendar uma reunião de diagnóstico gratuita!`;
    }

    return {
      text,
      steps,
      toolsUsed,
      modelUsed: 'openrouter/fallback-engine',
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
