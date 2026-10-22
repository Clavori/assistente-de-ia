import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const assistant = await prisma.assistantConfig.findFirst();
  return NextResponse.json({ assistant });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await req.json();
  const assistant = await prisma.assistantConfig.findFirst();
  if (!assistant) {
    return NextResponse.json({ error: 'Asistente no encontrado' }, { status: 404 });
  }

  const updated = await prisma.assistantConfig.update({
    where: { id: assistant.id },
    data: {
      name: data.name ?? assistant.name,
      avatar: data.avatar ?? assistant.avatar,
      tone: data.tone ?? assistant.tone,
      welcomeMessage: data.welcomeMessage ?? assistant.welcomeMessage,
      instructions: data.instructions ?? assistant.instructions,
      neverDoRules: data.neverDoRules ?? assistant.neverDoRules,
      escalateTriggers: data.escalateTriggers ?? assistant.escalateTriggers,
      active: data.active !== undefined ? data.active : assistant.active,
      modelSelected: data.modelSelected ?? assistant.modelSelected,
      safeMode: data.safeMode !== undefined ? data.safeMode : assistant.safeMode
    }
  });

  return NextResponse.json({ success: true, assistant: updated });
}
