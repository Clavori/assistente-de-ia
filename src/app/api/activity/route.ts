import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const integration = searchParams.get('integration') || 'all';
    const result = searchParams.get('result') || 'all';

    const whereClause: any = {};
    if (integration !== 'all') {
      whereClause.integration = integration;
    }
    if (result !== 'all') {
      whereClause.result = result;
    }

    let logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 60
    });

    if (logs.length === 0 && integration === 'all' && result === 'all') {
      await seedDemoActivity();
      logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 60
      });
    }

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function seedDemoActivity() {
  await prisma.activityLog.createMany({
    data: [
      {
        channel: 'whatsapp',
        integration: 'google_calendar',
        action: 'appointment_created',
        details: {
          cliente: 'Mariana Silveira',
          servico: 'Reunião de Diagnóstico de IA',
          data_hora: '2026-10-23T14:30:00',
          googleEventId: 'evt_gc_893821039'
        },
        result: 'success',
        createdAt: new Date(Date.now() - 15 * 60000)
      },
      {
        channel: 'whatsapp',
        integration: 'gmail',
        action: 'email_sent',
        details: {
          destinatario: 'mariana.silveira@email.com',
          assunto: 'Confirmação de Reunião: Andrade Studio AI',
          status: 'delivered'
        },
        result: 'success',
        createdAt: new Date(Date.now() - 14 * 60000)
      },
      {
        channel: 'whatsapp',
        integration: 'google_sheets',
        action: 'contact_sync',
        details: {
          nome: 'Mariana Silveira',
          telefone: '+55 11 99234-8899',
          linhaPlanilha: 142
        },
        result: 'success',
        createdAt: new Date(Date.now() - 14 * 60000)
      },
      {
        channel: 'whatsapp',
        integration: 'slack',
        action: 'slack_alert',
        details: {
          canal: '#alertas-ia',
          urgencia: 'alta',
          mensagem: '🚨 Rodrigo Medeiros solicitou atendimento humano para negociação corporativa.'
        },
        result: 'success',
        createdAt: new Date(Date.now() - 38 * 60000)
      },
      {
        channel: 'web',
        integration: 'openrouter',
        action: 'model_call',
        details: {
          model: 'anthropic/claude-haiku-5.5',
          tokensInput: 412,
          tokensOutput: 89,
          tempoRespostaMs: 780
        },
        result: 'success',
        createdAt: new Date(Date.now() - 55 * 60000)
      }
    ]
  });
}
