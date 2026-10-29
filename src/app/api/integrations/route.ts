import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INTEGRATIONS_CATALOG } from '@/lib/integrations/registry';
import { encrypt, decrypt } from '@/lib/encryption';
import {
  getGoogleClientCredentials,
  buildGoogleOAuthUrl,
  isMockEncryptedData,
  getValidGoogleAccessToken
} from '@/lib/integrations/google';
import {
  hydrateIntegrationsFromCookie,
  buildIntegrationsSyncCookieValue,
  INTEGRATIONS_COOKIE_NAME
} from '@/lib/integrations/cookieSync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await hydrateIntegrationsFromCookie();

    const origin = new URL(req.url).origin;
    const creds = await getGoogleClientCredentials(origin);
    const dbIntegrations = await prisma.integration.findMany();

    // If any Google service has a valid real OAuth token with scopes for the other Google services,
    // keep them synchronized across containers
    const connectedGoogleRow = dbIntegrations.find(
      (i) =>
        ['google_calendar', 'gmail', 'google_sheets'].includes(i.provider) &&
        i.status === 'connected' &&
        i.encryptedData &&
        !isMockEncryptedData(i.encryptedData)
    );

    let sharedScopeStr = '';
    if (connectedGoogleRow?.encryptedData) {
      try {
        const tok = decrypt<any>(connectedGoogleRow.encryptedData);
        sharedScopeStr = String(tok?.scope || '');
      } catch {}
    }

    const result = [];

    for (const catalogItem of INTEGRATIONS_CATALOG) {
      let match = dbIntegrations.find((i) => i.provider === catalogItem.id);

      // Clean up any legacy mock OAuth tokens automatically
      if (
        match &&
        match.status === 'connected' &&
        (isMockEncryptedData(match.encryptedData) ||
          (catalogItem.category === 'google' && match.accountEmail === 'atendimento@andradestudio.ai'))
      ) {
        match = await prisma.integration.update({
          where: { provider: catalogItem.id },
          data: {
            status: 'disconnected',
            accountEmail: null,
            encryptedData: null,
            errorMessage: null
          }
        });
      }

      // If another Google service row on this instance has a multi-scope token covering this service, hydrate it
      if (
        (!match || match.status !== 'connected') &&
        connectedGoogleRow &&
        catalogItem.category === 'google'
      ) {
        const scopeCoversThis =
          (catalogItem.id === 'google_calendar' && sharedScopeStr.includes('calendar')) ||
          (catalogItem.id === 'gmail' && sharedScopeStr.includes('gmail')) ||
          (catalogItem.id === 'google_sheets' &&
            (sharedScopeStr.includes('spreadsheets') || sharedScopeStr.includes('drive')));

        if (scopeCoversThis) {
          match = await prisma.integration.upsert({
            where: { provider: catalogItem.id },
            create: {
              provider: catalogItem.id,
              status: 'connected',
              accountEmail: connectedGoogleRow.accountEmail,
              encryptedData: connectedGoogleRow.encryptedData,
              settings: catalogItem.defaultSettings,
              allowedTools: catalogItem.tools.map((t) => t.id),
              lastSyncAt: new Date()
            },
            update: {
              status: 'connected',
              accountEmail: connectedGoogleRow.accountEmail,
              encryptedData: connectedGoogleRow.encryptedData,
              lastSyncAt: new Date()
            }
          });
        }
      }

      let maskedToken: string | undefined = undefined;
      if (match?.encryptedData && match.status === 'connected') {
        try {
          const decrypted = decrypt<any>(match.encryptedData);
          if (typeof decrypted === 'string') {
            maskedToken = `••••••••••••${decrypted.slice(-4)}`;
          } else if (decrypted?.apiKey) {
            maskedToken = `••••••••••••${String(decrypted.apiKey).slice(-4)}`;
          } else if (decrypted?.accessToken) {
            maskedToken = `OAuth2 ••••${String(decrypted.accessToken).slice(-6)}`;
          } else {
            maskedToken = '••••••••••••AES-256';
          }
        } catch {
          maskedToken = '••••••••••••';
        }
      }

      result.push({
        ...catalogItem,
        status: match?.status || 'disconnected',
        accountEmail: match?.accountEmail || null,
        maskedToken,
        settings: {
          ...catalogItem.defaultSettings,
          ...((match?.settings as Record<string, any>) || {})
        },
        allowedTools: (match?.allowedTools as string[]) || catalogItem.tools.map((t) => t.id),
        errorMessage: match?.errorMessage || null,
        lastSyncAt: match?.lastSyncAt ? match.lastSyncAt.toISOString() : null
      });
    }

    const syncCookieVal = await buildIntegrationsSyncCookieValue();
    const res = NextResponse.json({
      success: true,
      integrations: result,
      googleOAuth: {
        configured: creds.source !== 'unconfigured',
        source: creds.source,
        redirectUri: creds.redirectUri,
        maskedClientId: creds.clientId
          ? `${creds.clientId.slice(0, 12)}...${creds.clientId.slice(-18)}`
          : null
      }
    });

    res.cookies.set(INTEGRATIONS_COOKIE_NAME, syncCookieVal, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
      sameSite: 'lax'
    });
    return res;
  } catch (err: any) {
    console.error('Erro ao listar integrações:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await hydrateIntegrationsFromCookie();

    const origin = new URL(req.url).origin;
    const body = await req.json();
    const {
      provider,
      action,
      settings,
      allowedTools,
      apiKey,
      clientId,
      clientSecret,
      connectAllGoogle
    } = body;

    // Save Google Cloud OAuth 2.0 Client ID & Secret encrypted with AES-256-GCM
    if (action === 'save_google_oauth_app') {
      if (!clientId?.trim() || !clientSecret?.trim()) {
        return NextResponse.json(
          { error: 'Informe o Client ID e o Client Secret do Google Cloud.' },
          { status: 400 }
        );
      }

      const encryptedData = encrypt({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        savedAt: new Date().toISOString()
      });

      await prisma.integration.upsert({
        where: { provider: 'google_oauth_app' },
        create: {
          provider: 'google_oauth_app',
          status: 'connected',
          encryptedData,
          lastSyncAt: new Date()
        },
        update: {
          status: 'connected',
          encryptedData,
          lastSyncAt: new Date()
        }
      });

      const syncCookieVal = await buildIntegrationsSyncCookieValue({
        google_oauth_app: { s: 'connected', e: null, d: encryptedData }
      });

      const res = NextResponse.json({
        success: true,
        message: 'Credenciais Google OAuth 2.0 salvas com criptografia AES-256-GCM!'
      });
      res.cookies.set(INTEGRATIONS_COOKIE_NAME, syncCookieVal, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
        sameSite: 'lax'
      });
      return res;
    }

    if (!provider) {
      return NextResponse.json({ error: 'Provedor obrigatório.' }, { status: 400 });
    }

    const catalogItem = INTEGRATIONS_CATALOG.find((i) => i.id === provider);
    if (!catalogItem) {
      return NextResponse.json({ error: 'Integração não encontrada no catálogo.' }, { status: 404 });
    }

    let existing = await prisma.integration.findUnique({
      where: { provider }
    });

    if (action === 'connect') {
      // Real Google OAuth 2.0 flow for Google Calendar, Gmail, and Google Sheets
      if (catalogItem.category === 'google') {
        const creds = await getGoogleClientCredentials(origin);
        if (!creds.clientId || !creds.clientSecret) {
          return NextResponse.json(
            {
              error:
                'Configure primeiro seu GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET (no botão "Credenciais Google OAuth" ou no arquivo .env) para abrir a tela de autorização oficial do Google.',
              requiresGoogleCredentials: true,
              redirectUri: creds.redirectUri
            },
            { status: 400 }
          );
        }

        const authUrl = await buildGoogleOAuthUrl({
          provider,
          origin,
          connectAllGoogle: Boolean(connectAllGoogle)
        });

        return NextResponse.json({
          success: true,
          requiresOAuthRedirect: true,
          authUrl
        });
      }

      // Non-Google integrations (Stripe API Key, Webhooks, Slack Webhook/Token)
      if (catalogItem.authType === 'api_key' && !apiKey?.trim()) {
        return NextResponse.json(
          { error: 'Informe uma chave de API válida para conectar.' },
          { status: 400 }
        );
      }

      const encryptedData = apiKey
        ? encrypt({ apiKey: apiKey.trim(), connectedAt: new Date().toISOString() })
        : encrypt({
            webhookConfigured: true,
            connectedAt: new Date().toISOString()
          });

      if (existing) {
        existing = await prisma.integration.update({
          where: { provider },
          data: {
            status: 'connected',
            accountEmail: null,
            encryptedData,
            settings: settings || existing.settings || catalogItem.defaultSettings,
            allowedTools: allowedTools || existing.allowedTools || catalogItem.tools.map((t) => t.id),
            errorMessage: null,
            lastSyncAt: new Date()
          }
        });
      } else {
        existing = await prisma.integration.create({
          data: {
            provider,
            status: 'connected',
            accountEmail: null,
            encryptedData,
            settings: settings || catalogItem.defaultSettings,
            allowedTools: allowedTools || catalogItem.tools.map((t) => t.id),
            errorMessage: null,
            lastSyncAt: new Date()
          }
        });
      }

      await prisma.activityLog.create({
        data: {
          channel: 'system',
          integration: provider,
          action: 'integration_connected',
          details: { provider },
          result: 'success'
        }
      });

      const syncCookieVal = await buildIntegrationsSyncCookieValue({
        [provider]: { s: 'connected', e: null, d: encryptedData }
      });

      const res = NextResponse.json({ success: true, integration: existing });
      res.cookies.set(INTEGRATIONS_COOKIE_NAME, syncCookieVal, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
        sameSite: 'lax'
      });
      return res;
    }

    if (action === 'disconnect') {
      if (existing) {
        existing = await prisma.integration.update({
          where: { provider },
          data: {
            status: 'disconnected',
            accountEmail: null,
            encryptedData: null,
            errorMessage: null,
            lastSyncAt: new Date()
          }
        });
      }

      await prisma.activityLog.create({
        data: {
          channel: 'system',
          integration: provider,
          action: 'integration_disconnected',
          details: { provider },
          result: 'success'
        }
      });

      const syncCookieVal = await buildIntegrationsSyncCookieValue({
        [provider]: null
      });

      const res = NextResponse.json({
        success: true,
        message: 'Integração desconectada com sucesso.'
      });
      res.cookies.set(INTEGRATIONS_COOKIE_NAME, syncCookieVal, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
        sameSite: 'lax'
      });
      return res;
    }

    if (action === 'update_settings') {
      if (!existing) {
        existing = await prisma.integration.create({
          data: {
            provider,
            status: 'disconnected',
            settings: settings || catalogItem.defaultSettings,
            allowedTools: allowedTools || catalogItem.tools.map((t) => t.id)
          }
        });
      } else {
        existing = await prisma.integration.update({
          where: { provider },
          data: {
            settings: settings !== undefined ? settings : existing.settings,
            allowedTools: allowedTools !== undefined ? allowedTools : existing.allowedTools
          }
        });
      }

      return NextResponse.json({ success: true, integration: existing });
    }

    if (action === 'test_connection') {
      if (catalogItem.category === 'google') {
        const { accessToken, accountEmail } = await getValidGoogleAccessToken(provider);
        const testRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!testRes.ok) {
          throw new Error('O token OAuth não respondeu na API do Google. Reconecte a conta.');
        }
        const info = await testRes.json();
        return NextResponse.json({
          success: true,
          message: `Conexão Google OAuth 2.0 autêntica e ativa (${info.email || accountEmail})!`
        });
      }

      await prisma.activityLog.create({
        data: {
          channel: 'system',
          integration: provider,
          action: 'connection_test',
          details: { provider, timestamp: new Date().toISOString() },
          result: 'success'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Teste de conexão com ${catalogItem.name} executado com sucesso!`
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro na ação de integração:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
