import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getWhatsAppStatus,
  startWhatsAppSession,
  disconnectWhatsAppSession,
  requestWhatsAppPairingCode
} from '@/lib/whatsapp/manager';

export const dynamic = 'force-dynamic';

const WA_COOKIE = 'andrade_wa_connected';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const heartbeat = url.searchParams.get('heartbeat') === '1';
    const cookieStore = cookies();
    const savedWaCookie = cookieStore.get(WA_COOKIE)?.value;
    const savedPhoneFromQuery = url.searchParams.get('connectedPhone');

    const data = await getWhatsAppStatus({ heartbeat });

    // If this container just connected, set the persistent cookie
    if (data.status === 'connected') {
      const phone = data.connectedNumber || savedWaCookie || savedPhoneFromQuery || null;
      const res = NextResponse.json({
        ...data,
        status: 'connected',
        qrCode: null,
        connectedNumber: phone
      });
      if (phone) {
        res.cookies.set(WA_COOKIE, phone, {
          httpOnly: false,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax'
        });
      }
      return res;
    }

    // If the user already connected in this session (cookie or query present)
    // and this request hit a secondary serverless instance, preserve the connected state
    // instead of flashing a QR code when switching pages!
    const knownPhone = savedWaCookie || savedPhoneFromQuery;
    if (knownPhone) {
      return NextResponse.json({
        status: 'connected',
        isSocketOpen: true,
        qrCode: null,
        pairingCode: null,
        connectedNumber: knownPhone,
        lastActiveAt: new Date().toISOString()
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone } = body;

    if (action === 'disconnect') {
      const status = await disconnectWhatsAppSession();
      const res = NextResponse.json({
        success: true,
        ...status,
        message: 'Sessão desconectada e novo QR Code preparado.'
      });
      res.cookies.delete(WA_COOKIE);
      return res;
    }

    if (action === 'restart' || action === 'refresh_qr') {
      await startWhatsAppSession(true);
      await new Promise((r) => setTimeout(r, 1200));
      const status = await getWhatsAppStatus();
      const res = NextResponse.json({
        success: true,
        ...status,
        message: 'Novo QR Code gerado com sucesso.'
      });
      res.cookies.delete(WA_COOKIE);
      return res;
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
