import { NextResponse } from 'next/server';
import {
  getWhatsAppStatus,
  startWhatsAppSession,
  disconnectWhatsAppSession,
  requestWhatsAppPairingCode,
  markWhatsAppConnected
} from '@/lib/whatsapp/manager';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const keepConnected = url.searchParams.get('keepConnected') === 'true';
    const connectedPhone = url.searchParams.get('connectedPhone');

    if (keepConnected) {
      const data = await markWhatsAppConnected(connectedPhone || undefined);
      return NextResponse.json(data);
    }

    const data = await getWhatsAppStatus();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone } = body;

    if (action === 'sync_connected') {
      const status = await markWhatsAppConnected(phone || undefined);
      return NextResponse.json({
        success: true,
        ...status
      });
    }

    if (action === 'disconnect') {
      const status = await disconnectWhatsAppSession();
      return NextResponse.json({
        success: true,
        ...status,
        message: 'Sessão desconectada e novo QR Code preparado.'
      });
    }

    if (action === 'restart' || action === 'refresh_qr') {
      await startWhatsAppSession(true);
      await new Promise((r) => setTimeout(r, 1200));
      const status = await getWhatsAppStatus();
      return NextResponse.json({
        success: true,
        ...status,
        message: 'Novo QR Code gerado com sucesso.'
      });
    }

    if (action === 'pairing_code') {
      const code = await requestWhatsAppPairingCode(phone || '');
      return NextResponse.json({
        success: true,
        pairingCode: code
      });
    }

    return NextResponse.json({ error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
