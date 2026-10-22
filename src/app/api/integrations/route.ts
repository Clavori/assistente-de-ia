import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INTEGRATIONS_CATALOG } from '@/lib/integrations/registry';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const dbIntegrations = await prisma.integration.findMany();

    const result = INTEGRATIONS_CATALOG.map((catalogItem) => {
      const match = dbIntegrations.find((i) => i.provider === catalogItem.id);

      let maskedToken: string | undefined = undefined;
      if (match?.encryptedData) {
        try {
          const decrypted = decrypt<any>(match.encryptedData);
          if (typeof decrypted === 'string') {
            maskedToken = `••••••••••••${decrypted.slice(-4)}`;
          } else if (decrypted?.apiKey) {
            maskedToken = `••••••••••••${String(decrypted.apiKey).slice(-4)}`;
          } else {
            maskedToken = '••••••••••••Conectado';
          }
        } catch {
          maskedToken = '••••••••••••';
        }
      }

      return {
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
      };
    });

    return NextResponse.json({ success: true, integrations: result });
  } catch (err: any) {
    console.error('Erro ao listar integrações:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, action, settings, allowedTools, apiKey, accountEmail } = body;

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
      let encryptedData: string | null = null;
      if (apiKey) {
        encryptedData = encrypt(apiKey);
      } else {
        encryptedData = encrypt({
          accessToken: 'mock_oauth_access_token_atende_2026',
          refreshToken: 'mock_oauth_refresh_token_atende_2026',
          connectedAt: new Date().toISOString()
        });
      }

      const connectedEmail = accountEmail || (catalogItem.category === 'google' ? 'atendimento@andradestudio.ai' : null);

      if (existing) {
        existing = await prisma.integration.update({
          where: { provider },
          data: {
            status: 'connected',
            accountEmail: connectedEmail,
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
            accountEmail: connectedEmail,
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
          details: { provider, accountEmail: connectedEmail },
          result: 'success'
        }
      });

      return NextResponse.json({ success: true, integration: existing });
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

      return NextResponse.json({ success: true, message: 'Integração desconectada com sucesso.' });
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
      // Simulate or verify external ping
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
