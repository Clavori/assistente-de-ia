import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, text } = body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada.' }, { status: 404 });
    }

    if (action === 'send_message') {
      if (!text || !text.trim()) {
        return NextResponse.json({ error: 'Texto da mensagem obrigatório.' }, { status: 400 });
      }

      const msg = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'agent',
          text: text.trim()
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      });

      return NextResponse.json({ success: true, message: msg });
    }

    if (action === 'toggle_takeover') {
      const newStatus = conversation.status === 'human_takeover' ? 'bot_active' : 'human_takeover';
      const updated = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: newStatus,
          needsHuman: newStatus === 'human_takeover'
        }
      });

      await prisma.activityLog.create({
        data: {
          channel: conversation.channel,
          integration: 'system',
          action: newStatus === 'human_takeover' ? 'human_takeover_started' : 'bot_resumed',
          details: { conversationId: conversation.id, newStatus },
          result: 'success'
        }
      });

      return NextResponse.json({ success: true, conversation: updated });
    }

    return NextResponse.json({ error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
