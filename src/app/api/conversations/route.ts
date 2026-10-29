import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, needs_attention, whatsapp, web
    const search = searchParams.get('search') || '';

    const whereClause: any = {};

    if (filter === 'needs_attention') {
      whereClause.OR = [
        { needsHuman: true },
        { status: 'human_takeover' }
      ];
    } else if (filter === 'whatsapp') {
      whereClause.channel = 'whatsapp';
    } else if (filter === 'web') {
      whereClause.channel = 'web';
    }

    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { remoteId: { contains: search } },
        { contact: { name: { contains: search } } }
      ];
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // If zero conversations, seed 3 demo conversations for presentation
    if (conversations.length === 0 && !search && filter === 'all') {
      await seedDemoConversations();
      return GET(req);
    }

    return NextResponse.json({ success: true, conversations });
  } catch (err: any) {
    console.error('Erro ao listar conversas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function seedDemoConversations() {
  const contact1 = await prisma.contact.create({
    data: {
      name: 'Mariana Silveira',
      phone: '+55 11 99234-8899',
      channel: 'whatsapp',
      interest: 'Criação de Aplicativo Web Sob Medida'
    }
  });

  const conv1 = await prisma.conversation.create({
    data: {
      channel: 'whatsapp',
      remoteId: '5511992348899@s.whatsapp.net',
      status: 'bot_active',
      contactId: contact1.id,
      lastMessageAt: new Date(Date.now() - 10 * 60000)
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        sender: 'customer',
        text: 'Olá! Vocês desenvolvem aplicativo web com painel administrativo e login?',
        createdAt: new Date(Date.now() - 12 * 60000)
      },
      {
        conversationId: conv1.id,
        sender: 'assistant',
        text: 'Olá Mariana! Sim, desenvolvemos aplicativos web sob medida utilizando Next.js, Node.js e banco de dados em nuvem. Gostaria de agendar uma reunião de diagnóstico de 30 minutos sem custo para estruturarmos seu projeto?',
        toolsUsed: ['consultar_servicos'],
        createdAt: new Date(Date.now() - 11 * 60000)
      },
      {
        conversationId: conv1.id,
        sender: 'customer',
        text: 'Perfeito! Qual dia você tem horário livre amanhã?',
        createdAt: new Date(Date.now() - 10 * 60000)
      }
    ]
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Rodrigo Medeiros (Empresa LogX)',
      phone: '+55 21 98112-4433',
      channel: 'whatsapp',
      interest: 'Automação de WhatsApp e IA'
    }
  });

  const conv2 = await prisma.conversation.create({
    data: {
      channel: 'whatsapp',
      remoteId: '5521981124433@s.whatsapp.net',
      status: 'human_takeover',
      needsHuman: true,
      contactId: contact2.id,
      lastMessageAt: new Date(Date.now() - 35 * 60000)
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        sender: 'customer',
        text: 'Estou com uma dúvida sobre volume de mensagens e quero negociar uma proposta corporativa para 15 mil clientes.',
        createdAt: new Date(Date.now() - 40 * 60000)
      },
      {
        conversationId: conv2.id,
        sender: 'assistant',
        text: 'Com certeza Rodrigo! Para negociações de volume corporativo, vou transferir seu atendimento agora mesmo para nosso diretor técnico especializado.',
        toolsUsed: ['transferir_para_humano', 'notificar_equipe_slack'],
        createdAt: new Date(Date.now() - 38 * 60000)
      },
      {
        conversationId: conv2.id,
        sender: 'agent',
        text: 'Olá Rodrigo, aqui é o Carlos da Andrade Studio AI. Vi sua solicitação e já preparei nossa tabela para grandes volumes. Pode me falar um pouco mais sobre o fluxo?',
        createdAt: new Date(Date.now() - 35 * 60000)
      }
    ]
  });

  const contact3 = await prisma.contact.create({
    data: {
      name: 'Fernanda Lopes',
      channel: 'web',
      interest: 'Landing Page com IA'
    }
  });

  const conv3 = await prisma.conversation.create({
    data: {
      channel: 'web',
      remoteId: 'web-session-demo-01',
      status: 'bot_active',
      contactId: contact3.id,
      lastMessageAt: new Date(Date.now() - 60 * 60000)
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv3.id,
        sender: 'customer',
        text: 'Boa tarde! Qual é o prazo médio de entrega de uma landing page?',
        createdAt: new Date(Date.now() - 62 * 60000)
      },
      {
        conversationId: conv3.id,
        sender: 'assistant',
        text: 'Boa tarde Fernanda! Nossas landing pages de alta conversão costumam ser entregues em até 5 a 7 dias úteis, já com integração a WhatsApp e design responsivo!',
        toolsUsed: ['consultar_servicos'],
        createdAt: new Date(Date.now() - 60 * 60000)
      }
    ]
  });
}
