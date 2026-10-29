import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { INTEGRATIONS_CATALOG } from './registry';

export interface StoredGoogleOAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
  scope?: string;
  tokenType?: string;
  connectedAt: string;
  isRealOAuth: boolean;
}

export interface GoogleOAuthClientCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  source: 'env' | 'database' | 'unconfigured';
}

const GOOGLE_SCOPES_BY_PROVIDER: Record<string, string[]> = {
  google_calendar: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  gmail: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
  ],
  google_sheets: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ]
};

/**
 * Retrieve Google OAuth Client ID and Secret from environment variables
 * or from the encrypted `google_oauth_app` record in the Integration table.
 */
export async function getGoogleClientCredentials(origin: string): Promise<GoogleOAuthClientCredentials> {
  const defaultRedirect =
    process.env.GOOGLE_REDIRECT_URI || `${origin.replace(/\/$/, '')}/api/integrations/google/callback`;

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID.trim(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      redirectUri: defaultRedirect,
      source: 'env'
    };
  }

  try {
    const dbConfig = await prisma.integration.findUnique({
      where: { provider: 'google_oauth_app' }
    });
    if (dbConfig?.encryptedData) {
      const creds = decrypt<{ clientId?: string; clientSecret?: string }>(dbConfig.encryptedData);
      if (creds?.clientId && creds?.clientSecret) {
        return {
          clientId: creds.clientId.trim(),
          clientSecret: creds.clientSecret.trim(),
          redirectUri: defaultRedirect,
          source: 'database'
        };
      }
    }
  } catch (err) {
    console.error('Erro ao ler credenciais OAuth do banco:', err);
  }

  return {
    clientId: '',
    clientSecret: '',
    redirectUri: defaultRedirect,
    source: 'unconfigured'
  };
}

/**
 * Sign state payload with HMAC-SHA256 to prevent CSRF attacks during OAuth flow
 */
export function createSignedOAuthState(payload: {
  provider: string;
  connectAllGoogle?: boolean;
  origin: string;
}): string {
  const data = {
    ...payload,
    nonce: crypto.randomBytes(12).toString('hex'),
    ts: Date.now()
  };
  const json = JSON.stringify(data);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const secret = process.env.ENCRYPTION_KEY || 'default-secret-encryption-key-32-chars-atende-ai!';
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifySignedOAuthState(state: string): {
  provider: string;
  connectAllGoogle?: boolean;
  origin: string;
  ts: number;
} {
  const [b64, sig] = state.split('.');
  if (!b64 || !sig) {
    throw new Error('Parâmetro state OAuth inválido.');
  }
  const secret = process.env.ENCRYPTION_KEY || 'default-secret-encryption-key-32-chars-atende-ai!';
  const expectedSig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  if (sig !== expectedSig) {
    throw new Error('Assinatura CSRF do state OAuth inválida.');
  }
  const parsed = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  // Expire state after 15 minutes
  if (Date.now() - parsed.ts > 15 * 60 * 1000) {
    throw new Error('Sessão de autorização OAuth expirada. Tente conectar novamente.');
  }
  return parsed;
}

/**
 * Build Google OAuth 2.0 Authorization URL
 */
export async function buildGoogleOAuthUrl(params: {
  provider: string;
  origin: string;
  connectAllGoogle?: boolean;
}): Promise<string> {
  const { provider, origin, connectAllGoogle = false } = params;
  const creds = await getGoogleClientCredentials(origin);

  if (!creds.clientId || !creds.clientSecret) {
    throw new Error(
      'Credenciais Google OAuth (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET) ainda não configuradas.'
    );
  }

  let scopes: string[];
  if (connectAllGoogle) {
    const all = new Set<string>([
      ...GOOGLE_SCOPES_BY_PROVIDER.google_calendar,
      ...GOOGLE_SCOPES_BY_PROVIDER.gmail,
      ...GOOGLE_SCOPES_BY_PROVIDER.google_sheets
    ]);
    scopes = Array.from(all);
  } else {
    scopes = GOOGLE_SCOPES_BY_PROVIDER[provider] || GOOGLE_SCOPES_BY_PROVIDER.google_calendar;
  }

  const state = createSignedOAuthState({ provider, connectAllGoogle, origin });

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', creds.clientId);
  url.searchParams.set('redirect_uri', creds.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);

  return url.toString();
}

/**
 * Exchange authorization code for tokens and fetch Google user profile
 */
export async function exchangeGoogleCodeForTokens(params: {
  code: string;
  origin: string;
}): Promise<{
  tokens: StoredGoogleOAuthToken;
  email: string;
  name?: string;
}> {
  const creds = await getGoogleClientCredentials(params.origin);
  if (!creds.clientId || !creds.clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados.');
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: creds.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(
      tokenData.error_description || tokenData.error || 'Falha ao trocar código OAuth por token no Google.'
    );
  }

  // Fetch user email from Google userinfo API
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const profileData = await profileRes.json();
  if (!profileRes.ok || !profileData.email) {
    throw new Error('Não foi possível obter o e-mail da conta Google autorizada.');
  }

  const expiresInSec = Number(tokenData.expires_in || 3600);
  const tokens: StoredGoogleOAuthToken = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + expiresInSec * 1000,
    scope: tokenData.scope,
    tokenType: tokenData.token_type || 'Bearer',
    connectedAt: new Date().toISOString(),
    isRealOAuth: true
  };

  return {
    tokens,
    email: profileData.email,
    name: profileData.name
  };
}

/**
 * Check if an encryptedData payload is a legacy mock token
 */
export function isMockEncryptedData(encryptedData: string | null | undefined): boolean {
  if (!encryptedData) return false;
  try {
    const decrypted = decrypt<any>(encryptedData);
    if (
      typeof decrypted === 'object' &&
      decrypted !== null &&
      (String(decrypted.accessToken || '').startsWith('mock_oauth_') ||
        String(decrypted.refreshToken || '').startsWith('mock_oauth_'))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get a valid Google OAuth access token for a provider, automatically refreshing if expired.
 */
export async function getValidGoogleAccessToken(provider: string): Promise<{
  accessToken: string;
  accountEmail: string | null;
  settings: Record<string, any>;
}> {
  const integration = await prisma.integration.findUnique({
    where: { provider }
  });

  if (!integration || integration.status !== 'connected' || !integration.encryptedData) {
    throw new Error(`Integração ${provider} não está conectada via OAuth.`);
  }

  const tokenData = decrypt<StoredGoogleOAuthToken>(integration.encryptedData);
  if (!tokenData?.accessToken || tokenData.accessToken.startsWith('mock_oauth_')) {
    throw new Error(`Token OAuth de ${provider} é inválido ou de demonstração. Conecte sua conta Google real.`);
  }

  const catalogItem = INTEGRATIONS_CATALOG.find((i) => i.id === provider);
  const mergedSettings = {
    ...(catalogItem?.defaultSettings || {}),
    ...((integration.settings as Record<string, any>) || {})
  };

  // Check if token is expiring in the next 60 seconds
  const isExpired = tokenData.expiresAt ? Date.now() > tokenData.expiresAt - 60_000 : false;

  if (isExpired && tokenData.refreshToken) {
    const creds = await getGoogleClientCredentials('http://localhost:3000');
    if (!creds.clientId || !creds.clientSecret) {
      throw new Error('Credenciais OAuth ausentes para renovar o access_token.');
    }

    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: tokenData.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    const refreshJson = await refreshRes.json();
    if (!refreshRes.ok || !refreshJson.access_token) {
      await prisma.integration.update({
        where: { provider },
        data: {
          status: 'error',
          errorMessage: 'Sessão Google expirada ou revogada. Reconecte sua conta.'
        }
      });
      throw new Error('Sessão Google expirada. Reconecte sua conta em Integrações.');
    }

    const updatedToken: StoredGoogleOAuthToken = {
      ...tokenData,
      accessToken: refreshJson.access_token,
      expiresAt: Date.now() + Number(refreshJson.expires_in || 3600) * 1000,
      refreshToken: refreshJson.refresh_token || tokenData.refreshToken
    };

    await prisma.integration.update({
      where: { provider },
      data: {
        encryptedData: encrypt(updatedToken),
        lastSyncAt: new Date(),
        errorMessage: null
      }
    });

    return {
      accessToken: updatedToken.accessToken,
      accountEmail: integration.accountEmail,
      settings: mergedSettings
    };
  }

  return {
    accessToken: tokenData.accessToken,
    accountEmail: integration.accountEmail,
    settings: mergedSettings
  };
}

/**
 * Real Google Calendar FreeBusy query to compute available slots on a YYYY-MM-DD date
 */
export async function queryGoogleCalendarAvailableSlots(dateStr: string): Promise<{
  slots: string[];
  fromRealCalendar: boolean;
}> {
  const { accessToken, settings } = await getValidGoogleAccessToken('google_calendar');
  const calendarId = settings.calendarId || 'primary';

  const candidateSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const durationMin = Number(settings.defaultDurationMinutes || 45);

  const timeMin = new Date(`${dateStr}T08:00:00-03:00`).toISOString();
  const timeMax = new Date(`${dateStr}T19:00:00-03:00`).toISOString();

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: 'America/Sao_Paulo',
      items: [{ id: calendarId }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro Google Calendar API: ${errText}`);
  }

  const data = await res.json();
  const busyRanges: Array<{ start: string; end: string }> =
    data?.calendars?.[calendarId]?.busy || [];

  const available = candidateSlots.filter((slot) => {
    const slotStart = new Date(`${dateStr}T${slot}:00-03:00`).getTime();
    const slotEnd = slotStart + durationMin * 60_000;

    return !busyRanges.some((b) => {
      const busyStart = new Date(b.start).getTime();
      const busyEnd = new Date(b.end).getTime();
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  });

  return {
    slots: available,
    fromRealCalendar: true
  };
}

/**
 * Real Google Calendar Event creation
 */
export async function createGoogleCalendarEvent(params: {
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  attendeeEmail?: string | null;
}): Promise<{ eventId: string; htmlLink?: string }> {
  const { accessToken, settings } = await getValidGoogleAccessToken('google_calendar');
  const calendarId = encodeURIComponent(settings.calendarId || 'primary');

  const eventBody: Record<string, any> = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: params.startDate.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: params.endDate.toISOString(),
      timeZone: 'America/Sao_Paulo'
    }
  };

  if (params.attendeeEmail && params.attendeeEmail.includes('@')) {
    eventBody.attendees = [{ email: params.attendeeEmail }];
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    }
  );

  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.message || 'Falha ao criar evento no Google Calendar.');
  }

  return {
    eventId: data.id,
    htmlLink: data.htmlLink
  };
}

/**
 * Real Gmail send email via Gmail REST API
 */
export async function sendRealGmailMessage(params: {
  to: string;
  subject: string;
  bodyText: string;
}): Promise<{ messageId: string }> {
  const { accessToken, accountEmail } = await getValidGoogleAccessToken('gmail');

  const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject, 'utf8').toString('base64')}?=`;
  const mimeLines = [
    ...(accountEmail ? [`From: AndradeStudio AI <${accountEmail}>`] : []),
    `To: ${params.to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    params.bodyText
  ];

  const rawMessage = Buffer.from(mimeLines.join('\r\n'), 'utf8').toString('base64url');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawMessage })
  });

  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.message || 'Falha ao enviar e-mail pela API do Gmail.');
  }

  return { messageId: data.id };
}

/**
 * Real Google Sheets append row
 */
export async function appendLeadToGoogleSheet(params: {
  name: string;
  phone: string;
  email?: string;
  channel: string;
  interest?: string;
  booked?: boolean;
}): Promise<{ spreadsheetUrl: string }> {
  const { accessToken, settings } = await getValidGoogleAccessToken('google_sheets');

  let spreadsheetId = '';
  const urlMatch = String(settings.spreadsheetUrl || '').match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1] && urlMatch[1] !== 'mock-atiende-leads') {
    spreadsheetId = urlMatch[1];
  }

  const sheetTab = settings.sheetTab || 'Leads';

  // If no real spreadsheet exists yet, create one automatically in the user's Google Drive!
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: settings.spreadsheetName || 'Contatos & Leads — AndradeStudio AI'
        },
        sheets: [
          {
            properties: {
              title: sheetTab
            }
          }
        ]
      })
    });

    const createdData = await createRes.json();
    if (!createRes.ok || !createdData.spreadsheetId) {
      throw new Error(
        createdData?.error?.message || 'Não foi possível criar ou localizar a planilha no Google Sheets.'
      );
    }

    spreadsheetId = createdData.spreadsheetId;
    const newUrl =
      createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Add header row
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTab)}!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [['Data/Hora', 'Nome', 'Telefone', 'E-mail', 'Canal', 'Interesse', 'Agendou Reunião']]
        })
      }
    );

    // Save the real spreadsheet URL in integration settings
    await prisma.integration.update({
      where: { provider: 'google_sheets' },
      data: {
        settings: {
          ...settings,
          spreadsheetUrl: newUrl
        }
      }
    });
    settings.spreadsheetUrl = newUrl;
  }

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTab)}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [
          [
            new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            params.name,
            params.phone,
            params.email || '',
            params.channel,
            params.interest || '',
            params.booked ? 'Sim' : 'Não'
          ]
        ]
      })
    }
  );

  if (!appendRes.ok) {
    const errData = await appendRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Erro ao inserir linha no Google Sheets.');
  }

  return {
    spreadsheetUrl:
      settings.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}
