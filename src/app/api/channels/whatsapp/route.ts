import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conn = await prisma.whatsappConnection.findFirst({
      where: { id: 'default' }
    });

    return NextResponse.json({
      status: conn?.status || 'disconnected',
      qrCode: conn?.qrCode || null,
      connectedNumber: conn?.connectedNumber || null,
      lastActiveAt: conn?.lastActiveAt || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'disconnect') {
      await prisma.workerCommand.create({
        data: {
          command: 'disconnect',
          status: 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Comando de desconexão enviado ao worker com sucesso.'
      });
    }

    if (action === 'restart' || action === 'refresh_qr') {
      await prisma.workerCommand.create({
        data: {
          command: 'restart',
          status: 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Comando de reinício enviado ao worker.'
      });
    }

    return NextResponse.json({ error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
