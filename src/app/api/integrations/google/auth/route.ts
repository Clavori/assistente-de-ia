import { NextRequest, NextResponse } from 'next/server';
import { buildGoogleOAuthUrl, getGoogleClientCredentials } from '@/lib/integrations/google';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'google_calendar';
    const connectAll = url.searchParams.get('connectAll') === 'true';
    const mode = url.searchParams.get('mode'); // 'json' or redirect

    const origin = url.origin;
    const creds = await getGoogleClientCredentials(origin);

    if (!creds.clientId || !creds.clientSecret) {
      if (mode === 'json') {
        return NextResponse.json(
          {
            configured: false,
            redirectUri: creds.redirectUri,
            error:
              'Credenciais Google Cloud (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET) ainda não configuradas.'
          },
          { status: 400 }
        );
      }
      const errUrl = new URL('/integraciones', origin);
      errUrl.searchParams.set('oauth_error', 'missing_credentials');
      errUrl.searchParams.set('provider', provider);
      return NextResponse.redirect(errUrl);
    }

    const authUrl = await buildGoogleOAuthUrl({
      provider,
      origin,
      connectAllGoogle: connectAll
    });

    if (mode === 'json') {
      return NextResponse.json({
        configured: true,
        authUrl,
        redirectUri: creds.redirectUri
      });
    }

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
