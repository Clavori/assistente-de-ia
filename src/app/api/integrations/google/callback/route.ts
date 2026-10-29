import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { INTEGRATIONS_CATALOG } from '@/lib/integrations/registry';
import {
  verifySignedOAuthState,
  exchangeGoogleCodeForTokens
} from '@/lib/integrations/google';
import {
  hydrateIntegrationsFromCookie,
  buildIntegrationsSyncCookieValue,
  INTEGRATIONS_COOKIE_NAME
} from '@/lib/integrations/cookieSync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    const redirectUrl = new URL('/integraciones', origin);
    redirectUrl.searchParams.set('oauth_error', oauthError);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    const redirectUrl = new URL('/integraciones', origin);
    redirectUrl.searchParams.set('oauth_error', 'Código de autorização OAuth ausente.');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await hydrateIntegrationsFromCookie();

    const stateData = verifySignedOAuthState(state);
    const { tokens, email } = await exchangeGoogleCodeForTokens({
      code,
      origin: stateData.origin || origin
    });

    const encryptedData = encrypt(tokens);
    const scopeStr = String(tokens.scope || '');

    // Automatically activate all Google services whose scopes were granted by the user
    const providersSet = new Set<string>([stateData.provider]);
    if (stateData.connectAllGoogle) {
      providersSet.add('google_calendar');
      providersSet.add('gmail');
      providersSet.add('google_sheets');
    }
    if (scopeStr.includes('calendar')) providersSet.add('google_calendar');
    if (scopeStr.includes('gmail')) providersSet.add('gmail');
    if (scopeStr.includes('spreadsheets') || scopeStr.includes('drive')) {
      providersSet.add('google_sheets');
    }

    const providersToConnect = Array.from(providersSet);
    const cookieUpdates: Record<string, { s: string; e: string | null; d: string | null }> = {};

    for (const provider of providersToConnect) {
      const catalogItem = INTEGRATIONS_CATALOG.find((i) => i.id === provider);
      if (!catalogItem) continue;

      const existing = await prisma.integration.findUnique({
        where: { provider }
      });

      if (existing) {
        await prisma.integration.update({
          where: { provider },
          data: {
            status: 'connected',
            accountEmail: email,
            encryptedData,
            settings: existing.settings || catalogItem.defaultSettings,
            allowedTools: existing.allowedTools || catalogItem.tools.map((t) => t.id),
            errorMessage: null,
            lastSyncAt: new Date()
          }
        });
      } else {
        await prisma.integration.create({
          data: {
            provider,
            status: 'connected',
            accountEmail: email,
            encryptedData,
            settings: catalogItem.defaultSettings,
            allowedTools: catalogItem.tools.map((t) => t.id),
            errorMessage: null,
            lastSyncAt: new Date()
          }
        });
      }

      cookieUpdates[provider] = {
        s: 'connected',
        e: email,
        d: encryptedData
      };

      await prisma.activityLog.create({
        data: {
          channel: 'system',
          integration: provider,
          action: 'google_oauth_connected',
          details: {
            provider,
            accountEmail: email,
            scope: tokens.scope
          },
          result: 'success'
        }
      });
    }

    const syncCookieVal = await buildIntegrationsSyncCookieValue(cookieUpdates);

    const redirectUrl = new URL('/integraciones', origin);
    redirectUrl.searchParams.set('oauth_success', providersToConnect.join(','));
    redirectUrl.searchParams.set('email', email);

    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set(INTEGRATIONS_COOKIE_NAME, syncCookieVal, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      sameSite: 'lax'
    });
    return res;
  } catch (err: any) {
    console.error('Erro no callback Google OAuth:', err);
    const redirectUrl = new URL('/integraciones', origin);
    redirectUrl.searchParams.set('oauth_error', err.message || 'Erro ao autenticar com o Google.');
    return NextResponse.redirect(redirectUrl);
  }
}
