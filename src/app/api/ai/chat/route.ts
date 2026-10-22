import { NextRequest, NextResponse } from 'next/server';
import { runAssistantEngine } from '@/lib/ai/engine';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, safeMode, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Parâmetro "messages" obrigatório.' },
        { status: 400 }
      );
    }

    const result = await runAssistantEngine({
      messages,
      safeMode: typeof safeMode === 'boolean' ? safeMode : undefined,
      channel: 'web',
      conversationId
    });

    return NextResponse.json({
      success: true,
      text: result.text,
      steps: result.steps,
      toolsUsed: result.toolsUsed,
      modelUsed: result.modelUsed,
      escalated: result.escalated
    });
  } catch (err: any) {
    console.error('Erro na rota /api/ai/chat:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar conversa de IA.' },
      { status: 500 }
    );
  }
}
