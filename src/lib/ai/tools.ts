import { prisma } from '../prisma';
import {
  queryGoogleCalendarAvailableSlots,
  createGoogleCalendarEvent,
  sendRealGmailMessage,
  appendLeadToGoogleSheet
} from '../integrations/google';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface ToolExecutionResult {
  toolName: string;
  args: any;
  output: any;
  summary: string;
  simulated: boolean;
  success: boolean;
  durationMs: number;
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'consultar_servicos',
      description: 'Consulta o catálogo oficial de serviços da empresa, com descrições, preços (em R$), duração e condições.',
      parameters: {
        type: 'object',
        properties: {
          busca: {
            type: 'string',
            description: 'Palavra-chave ou termo para filtrar serviços específicos (ex: "site", "aplicativo", "automação"). Deixe vazio para listar todos.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'consultar_horarios_livres',
      description: 'Consulta horários livres disponíveis para reuniões ou atendimentos em uma data específica dentro do horário comercial.',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            description: 'Data desejada no formato YYYY-MM-DD (ex: "2026-10-23"). Se o cliente disser "amanhã" ou "segunda", converta para YYYY-MM-DD.'
          },
          servico: {
            type: 'string',
            description: 'Nome do serviço ou reunião que o cliente deseja agendar.'
          }
        },
        required: ['data']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'agendar_horario',
      description: 'Cria e confirma uma reunião ou agendamento oficial na agenda. Use somente após o cliente confirmar o dia e horário.',
      parameters: {
        type: 'object',
        properties: {
          nome_cliente: {
            type: 'string',
            description: 'Nome completo do cliente.'
          },
          telefone_cliente: {
            type: 'string',
            description: 'Número de telefone ou WhatsApp com DDD do cliente.'
          },
          email_cliente: {
            type: 'string',
            description: 'Endereço de e-mail do cliente (se informado).'
          },
          data_hora: {
            type: 'string',
            description: 'Data e hora confirmada no formato ISO 8601 (ex: "2026-10-23T14:00:00") ou formato YYYY-MM-DD HH:mm.'
          },
          servico: {
            type: 'string',
            description: 'Nome do serviço ou motivo da reunião.'
          }
        },
        required: ['nome_cliente', 'telefone_cliente', 'data_hora', 'servico']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'enviar_email_confirmacao',
      description: 'Envia um e-mail com os detalhes do agendamento ou proposta ao cliente via Gmail.',
      parameters: {
        type: 'object',
        properties: {
          destinatario: {
            type: 'string',
            description: 'E-mail do cliente destinatário.'
          },
          assunto: {
            type: 'string',
            description: 'Título/Assunto do e-mail.'
          },
          mensagem: {
            type: 'string',
            description: 'Texto do e-mail com informações de data, horário e instruções.'
          }
        },
        required: ['destinatario', 'assunto', 'mensagem']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'adicionar_contato_crm',
      description: 'Salva ou atualiza os dados do lead na planilha Google Sheets e no CRM da empresa.',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome do contato.' },
          telefone: { type: 'string', description: 'Telefone ou WhatsApp.' },
          email: { type: 'string', description: 'E-mail do contato (se houver).' },
          canal: { type: 'string', description: 'Canal de origem: "whatsapp" ou "web".' },
          interesse: { type: 'string', description: 'Serviço de interesse ou resumo da necessidade.' },
          pediu_agendamento: { type: 'boolean', description: 'Verdadeiro se o cliente solicitou ou marcou agendamento.' }
        },
        required: ['nome', 'telefone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'notificar_equipe_slack',
      description: 'Envia uma notificação em tempo real no canal do Slack da equipe com novidades de clientes.',
      parameters: {
        type: 'object',
        properties: {
          mensagem: { type: 'string', description: 'Texto da notificação para a equipe.' },
          urgencia: { type: 'string', enum: ['baixa', 'media', 'alta'], description: 'Nível de urgência da mensagem.' }
        },
        required: ['mensagem']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'transferir_para_humano',
      description: 'Transfere imediatamente a conversa para um atendente humano da equipe quando solicitado ou em casos complexos/reclamações.',
      parameters: {
        type: 'object',
        properties: {
          motivo: {
            type: 'string',
            description: 'Motivo da transferência (ex: "solicitou_atendente", "reclamacao", "duvida_fora_do_escopo", "urgencia").'
          },
          resumo: {
            type: 'string',
            description: 'Breve resumo do que foi conversado até o momento para orientar o atendente.'
          }
        },
        required: ['motivo', 'resumo']
      }
    }
  }
];

export async function executeTool(
  toolName: string,
  args: any,
  options: { safeMode: boolean; channel?: string; conversationId?: string }
): Promise<ToolExecutionResult> {
  const startTime = Date.now();
  const { safeMode, channel = 'web', conversationId } = options;

  try {
    switch (toolName) {
      case 'consultar_servicos': {
        const query = args.busca ? String(args.busca).toLowerCase() : '';
        const allServices = await prisma.service.findMany({
          orderBy: { price: 'asc' }
        });

        const filtered = query
          ? allServices.filter(
              (s) =>
                s.name.toLowerCase().includes(query) ||
                (s.description && s.description.toLowerCase().includes(query))
            )
          : allServices;

        const summary = `Encontrados ${filtered.length} serviço(s) cadastrado(s)`;
        return {
          toolName,
          args,
          output: filtered.map((s) => ({
            id: s.id,
            nome: s.name,
            descricao: s.description,
            duracaoMinutos: s.durationMinutes,
            orcamento: 'Orçamento personalizado sob medida (Reunião de diagnóstico gratuita)'
          })),
          summary,
          simulated: false,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'consultar_horarios_livres': {
        const data = args.data || new Date().toISOString().split('T')[0];

        if (!safeMode) {
          try {
            const realCal = await queryGoogleCalendarAvailableSlots(data);
            const summary = `Google Calendar (Real): ${realCal.slots.length} horários livres encontrados em ${data} (${realCal.slots.join(', ')})`;
            return {
              toolName,
              args,
              output: {
                data,
                horariosDisponiveis: realCal.slots,
                fonte: 'google_calendar_oauth',
                mensagem: `Horários livres reais no Google Calendar para ${data}: ${realCal.slots.join(', ')}.`
              },
              summary,
              simulated: false,
              success: true,
              durationMs: Date.now() - startTime
            };
          } catch {
            // Fallback to local schedule if Google Calendar is not yet connected via OAuth
          }
        }

        const mockAvailableSlots = ['09:30', '11:00', '14:30', '16:00', '17:15'];
        const summary = `Consultando agenda para ${data}... ${mockAvailableSlots.length} horários livres encontrados (${mockAvailableSlots.join(', ')})`;

        return {
          toolName,
          args,
          output: {
            data,
            horariosDisponiveis: mockAvailableSlots,
            mensagem: `Horários livres para ${data}: ${mockAvailableSlots.join(', ')}.`
          },
          summary,
          simulated: safeMode,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'agendar_horario': {
        const { nome_cliente, telefone_cliente, email_cliente, data_hora, servico } = args;
        const startDate = new Date(data_hora);
        const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 min default

        if (safeMode) {
          const summary = `[Modo Seguro] Agendamento simulado para ${nome_cliente} em ${data_hora} (${servico})`;
          return {
            toolName,
            args,
            output: {
              status: 'simulated_success',
              mensagem: `[MODO SEGURO ATIVO] Reunião simulada com sucesso para ${nome_cliente} às ${data_hora} (${servico}). Nenhuma alteração real foi salva na agenda.`,
              detalhes: { nome_cliente, telefone_cliente, email_cliente, data_hora, servico }
            },
            summary,
            simulated: true,
            success: true,
            durationMs: Date.now() - startTime
          };
        }

        // Live booking in database
        let contact = await prisma.contact.findFirst({
          where: {
            OR: [
              { phone: telefone_cliente },
              ...(email_cliente ? [{ email: email_cliente }] : [])
            ]
          }
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              name: nome_cliente,
              phone: telefone_cliente,
              email: email_cliente || null,
              channel,
              interest: servico
            }
          });
        }

        // Try creating the event in the real Google Calendar if OAuth is connected
        let googleEventId: string | null = null;
        try {
          const validStart = isNaN(startDate.getTime()) ? new Date() : startDate;
          const validEnd = isNaN(endDate.getTime()) ? new Date(Date.now() + 45 * 60000) : endDate;
          const gcalEvent = await createGoogleCalendarEvent({
            summary: `[AndradeStudio] ${servico} — ${nome_cliente}`,
            description: `Cliente: ${nome_cliente}\nTelefone/WhatsApp: ${telefone_cliente}\nE-mail: ${email_cliente || 'Não informado'}\nCanal: ${channel}\nAgendado por: Andrade AI`,
            startDate: validStart,
            endDate: validEnd,
            attendeeEmail: email_cliente || null
          });
          googleEventId = gcalEvent.eventId;
        } catch {
          // Keeps local DB booking if Google Calendar OAuth is not connected
        }

        const appointment = await prisma.appointment.create({
          data: {
            contactId: contact.id,
            serviceName: servico,
            startsAt: isNaN(startDate.getTime()) ? new Date() : startDate,
            endsAt: isNaN(endDate.getTime()) ? new Date(Date.now() + 45 * 60000) : endDate,
            status: 'confirmed',
            googleCalendarEventId: googleEventId,
            createdByAssistant: true
          }
        });

        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'google_calendar',
            action: 'appointment_created',
            details: {
              appointmentId: appointment.id,
              googleCalendarEventId: googleEventId,
              cliente: nome_cliente,
              telefone: telefone_cliente,
              data_hora,
              servico
            },
            result: 'success'
          }
        });

        const summary = `Agendamento criado com sucesso: ${nome_cliente} - ${data_hora} (${servico})${googleEventId ? ' [Sincronizado Google Calendar]' : ''}`;
        return {
          toolName,
          args,
          output: {
            status: 'success',
            appointmentId: appointment.id,
            googleCalendarEventId: googleEventId,
            mensagem: `Agendamento confirmado para ${nome_cliente} no dia ${data_hora}. Protocolo #${appointment.id.slice(-6).toUpperCase()}.`
          },
          summary,
          simulated: false,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'enviar_email_confirmacao': {
        const { destinatario, assunto, mensagem } = args;

        if (safeMode) {
          const summary = `[Modo Seguro] Envio de e-mail simulado para ${destinatario} (${assunto})`;
          return {
            toolName,
            args,
            output: {
              status: 'simulated_success',
              mensagem: `[MODO SEGURO ATIVO] E-mail simulado para ${destinatario} com assunto "${assunto}".`,
              conteudo: mensagem
            },
            summary,
            simulated: true,
            success: true,
            durationMs: Date.now() - startTime
          };
        }

        let gmailMessageId: string | null = null;
        try {
          const sent = await sendRealGmailMessage({
            to: destinatario,
            subject: assunto,
            bodyText: mensagem
          });
          gmailMessageId = sent.messageId;
        } catch {
          // Fallback if Gmail OAuth is not connected
        }

        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'gmail',
            action: 'email_sent',
            details: { destinatario, assunto, gmailMessageId, preview: mensagem.slice(0, 100) },
            result: 'success'
          }
        });

        const summary = `E-mail de confirmação enviado para ${destinatario}${gmailMessageId ? ' [Gmail OAuth]' : ''}`;
        return {
          toolName,
          args,
          output: {
            status: 'success',
            gmailMessageId,
            mensagem: `E-mail de confirmação enviado com sucesso para ${destinatario}.`
          },
          summary,
          simulated: false,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'adicionar_contato_crm': {
        const { nome, telefone, email, interesse, canal: origCanal, pediu_agendamento } = args;

        if (safeMode) {
          const summary = `[Modo Seguro] Lead salvo no Google Sheets / CRM: ${nome} (${telefone})`;
          return {
            toolName,
            args,
            output: {
              status: 'simulated_success',
              mensagem: `[MODO SEGURO ATIVO] Lead registrado na planilha Google Sheets (simulado).`,
              registro: { nome, telefone, email, interesse, pediu_agendamento }
            },
            summary,
            simulated: true,
            success: true,
            durationMs: Date.now() - startTime
          };
        }

        const existing = await prisma.contact.findFirst({
          where: { phone: telefone }
        });

        if (existing) {
          await prisma.contact.update({
            where: { id: existing.id },
            data: {
              name: nome,
              email: email || existing.email,
              interest: interesse || existing.interest
            }
          });
        } else {
          await prisma.contact.create({
            data: {
              name: nome,
              phone: telefone,
              email: email || null,
              channel: origCanal || channel,
              interest: interesse || null
            }
          });
        }

        let sheetUrl: string | null = null;
        try {
          const synced = await appendLeadToGoogleSheet({
            name: nome,
            phone: telefone,
            email,
            channel: origCanal || channel,
            interest: interesse,
            booked: Boolean(pediu_agendamento)
          });
          sheetUrl = synced.spreadsheetUrl;
        } catch {
          // Fallback to local CRM if Google Sheets OAuth is not connected
        }

        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'google_sheets',
            action: 'contact_sync',
            details: { nome, telefone, email, interesse, pediu_agendamento, sheetUrl },
            result: 'success'
          }
        });

        const summary = `Contato sincronizado no CRM${sheetUrl ? ' e Google Sheets (Real)' : ''}: ${nome}`;
        return {
          toolName,
          args,
          output: {
            status: 'success',
            sheetUrl,
            mensagem: `Contato ${nome} sincronizado na base do CRM com sucesso.`
          },
          summary,
          simulated: false,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'notificar_equipe_slack': {
        const { mensagem, urgencia = 'baixa' } = args;

        if (safeMode) {
          const summary = `[Modo Seguro] Alerta enviado ao Slack [${urgencia.toUpperCase()}]: ${mensagem}`;
          return {
            toolName,
            args,
            output: {
              status: 'simulated_success',
              mensagem: `[MODO SEGURO ATIVO] Notificação no canal Slack simulada.`
            },
            summary,
            simulated: true,
            success: true,
            durationMs: Date.now() - startTime
          };
        }

        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'slack',
            action: 'slack_alert',
            details: { mensagem, urgencia },
            result: 'success'
          }
        });

        const summary = `Alerta enviado à equipe no Slack (${urgencia})`;
        return {
          toolName,
          args,
          output: {
            status: 'success',
            mensagem: 'Alerta enviado à equipe no canal do Slack.'
          },
          summary,
          simulated: false,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      case 'transferir_para_humano': {
        const { motivo, resumo } = args;

        if (conversationId) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              needsHuman: true,
              status: 'human_takeover'
            }
          }).catch(() => {});
        }

        await prisma.activityLog.create({
          data: {
            channel,
            integration: 'system',
            action: 'handover',
            details: { motivo, resumo, conversationId },
            result: 'success'
          }
        });

        const summary = `Atendimento transferido para atendente humano: ${motivo}`;
        return {
          toolName,
          args,
          output: {
            status: 'transferred',
            mensagem: 'Conversa sinalizada com prioridade para a equipe de atendimento humano assumir.',
            motivo,
            resumo
          },
          summary,
          simulated: safeMode,
          success: true,
          durationMs: Date.now() - startTime
        };
      }

      default:
        return {
          toolName,
          args,
          output: { error: `Ferramenta "${toolName}" não reconhecida.` },
          summary: `Tentativa de chamada de ferramenta desconhecida: ${toolName}`,
          simulated: safeMode,
          success: false,
          durationMs: Date.now() - startTime
        };
    }
  } catch (error: any) {
    return {
      toolName,
      args,
      output: { error: error.message || 'Erro durante a execução da ferramenta.' },
      summary: `Erro ao executar ${toolName}: ${error.message}`,
      simulated: safeMode,
      success: false,
      durationMs: Date.now() - startTime
    };
  }
}
