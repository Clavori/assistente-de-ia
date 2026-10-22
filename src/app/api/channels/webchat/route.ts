import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.webChatConfig.findFirst({
      where: { id: 'default' }
    });

    if (!config) {
      config = await prisma.webChatConfig.create({
        data: {
          id: 'default',
          enabled: true,
          primaryColor: '#059669',
          welcomeMessage: 'Olá! Sou o assistente virtual da Andrade Studio AI. Como posso te ajudar hoje?',
          botName: 'Andrade AI',
          position: 'bottom-right'
        }
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enabled, primaryColor, welcomeMessage, botName, position } = body;

    const updated = await prisma.webChatConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        enabled: enabled ?? true,
        primaryColor: primaryColor || '#059669',
        welcomeMessage: welcomeMessage || 'Olá! Como posso ajudar?',
        botName: botName || 'Andrade AI',
        position: position || 'bottom-right'
      },
      update: {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(primaryColor ? { primaryColor } : {}),
        ...(welcomeMessage ? { welcomeMessage } : {}),
        ...(botName ? { botName } : {}),
        ...(position ? { position } : {})
      }
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
