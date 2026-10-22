import { IntegrationDefinition } from './types';

export const INTEGRATIONS_CATALOG: IntegrationDefinition[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincroniza reuniões e consultas na agenda oficial do Google da sua empresa.',
    icon: 'Calendar',
    category: 'google',
    authType: 'oauth',
    defaultSettings: {
      calendarId: 'primary',
      defaultDurationMinutes: 45,
      bufferBetweenAppointmentsMinutes: 15,
      minNoticeHours: 2,
      maxAdvanceBookingDays: 30
    },
    tools: [
      {
        id: 'consultar_horarios_livres',
        name: 'Consultar horários livres',
        description: 'Verificar horários disponíveis respeitando compromissos existentes e pausas da equipe.',
        defaultEnabled: true
      },
      {
        id: 'agendar_horario',
        name: 'Criar agendamento',
        description: 'Reservar nova reunião no Google Calendar com nome, telefone e etiqueta "Criado por Atende".',
        defaultEnabled: true
      },
      {
        id: 'alterar_horario',
        name: 'Reagendar horário',
        description: 'Alterar a data ou hora de um agendamento existente quando o cliente solicitar.',
        defaultEnabled: true
      },
      {
        id: 'cancelar_horario',
        name: 'Cancelar agendamento',
        description: 'Excluir compromisso na agenda caso o cliente informe cancelamento.',
        defaultEnabled: true
      }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Disparo de confirmações formais de agendamento e resumo diário executivo ao proprietário.',
    icon: 'Mail',
    category: 'google',
    authType: 'oauth',
    defaultSettings: {
      ownerNotificationEmail: 'contato@andradestudio.ai',
      dailySummaryEnabled: true,
      dailySummaryTime: '08:30',
      sendConfirmationToClient: true
    },
    tools: [
      {
        id: 'enviar_email_confirmacao',
        name: 'Enviar confirmação por e-mail',
        description: 'Disparar e-mail com link do Google Meet e detalhes do serviço após agendamento.',
        defaultEnabled: true
      },
      {
        id: 'enviar_resumo_executivo',
        name: 'Relatório diário por e-mail',
        description: 'Enviar resumo matinal de agendamentos e atendimentos pendentes ao gestor.',
        defaultEnabled: true
      }
    ]
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Planilha de contatos em nuvem (Drive) sincronizada automaticamente a cada lead qualificado.',
    icon: 'Sheet',
    category: 'google',
    authType: 'oauth',
    defaultSettings: {
      spreadsheetName: 'Contatos & Leads — Andrade Studio AI',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock-atiende-leads/edit',
      sheetTab: 'Leads'
    },
    tools: [
      {
        id: 'adicionar_contato_crm',
        name: 'Salvar lead na planilha',
        description: 'Registrar data, nome, telefone, canal, interesse e se agendou reunião.',
        defaultEnabled: true
      }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notificações instantâneas no canal da equipe técnica sobre novos leads, reuniões e transbordos.',
    icon: 'MessageSquare',
    category: 'comms',
    authType: 'oauth',
    defaultSettings: {
      channelName: '#alertas-ia',
      notifyOnNewBooking: true,
      notifyOnHandover: true,
      notifyOnUnknownQuestion: true
    },
    tools: [
      {
        id: 'notificar_equipe_slack',
        name: 'Alertas no canal do Slack',
        description: 'Postar mensagem formatada com botão direto para assumir a conversa.',
        defaultEnabled: true
      }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Cobrança online com geração de links de pagamento instantâneos (PIX, Cartão e Boleto).',
    icon: 'CreditCard',
    category: 'payment',
    authType: 'api_key',
    defaultSettings: {
      currency: 'BRL',
      stripeAccountId: '',
      requireDepositForBooking: false,
      depositAmount: 150.00
    },
    tools: [
      {
        id: 'gerar_link_pagamento',
        name: 'Gerar link de pagamento',
        description: 'Criar link de checkout do Stripe com valor do serviço ou taxa de reserva.',
        defaultEnabled: true
      },
      {
        id: 'verificar_status_pagamento',
        name: 'Verificar confirmação de pagamento',
        description: 'Consultar se a fatura ou cobrança gerada foi aprovada pelo cliente.',
        defaultEnabled: true
      }
    ]
  },
  {
    id: 'webhooks',
    name: 'Webhooks Salientes',
    description: 'Envio de payloads JSON assinados com HMAC-SHA256 para seus sistemas externos (n8n, Make, CRM).',
    icon: 'Webhook',
    category: 'automation',
    authType: 'webhook',
    defaultSettings: {
      endpointUrl: 'https://webhook.site/teste-atende-ai',
      secretKey: 'whsec_atende_ai_production_hmac_2026',
      events: ['appointment_created', 'handover_requested', 'contact_created', 'conversation_closed']
    },
    tools: [
      {
        id: 'disparar_webhook_externo',
        name: 'Disparar evento em tempo real',
        description: 'Enviar webhook HTTP POST com payload do evento assinado digitalmente.',
        defaultEnabled: true
      }
    ]
  }
];
