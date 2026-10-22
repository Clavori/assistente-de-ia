import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 10);

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      balance: null
    });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Atiende'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const limit = data.data?.limit;
      const usage = data.data?.usage;
      const balance = limit !== null && limit !== undefined ? (limit - (usage || 0)).toFixed(2) : null;
      return NextResponse.json({
        configured: true,
        label: data.data?.label || 'Clave OpenRouter',
        balance: balance ? `$${balance}` : 'Ilimitado / Prepago'
      });
    }
  } catch {}

  return NextResponse.json({
    configured: true,
    balance: 'Activa'
  });
}
