import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { INTEGRATIONS_CATALOG } from './registry';

const COOKIE_NAME = 'andrade_integrations_sync';

interface CompactIntegrationRecord {
  s: string; // status
  e: string | null; // accountEmail
  d: string | null; // encryptedData
}

type SyncMap = Record<string, CompactIntegrationRecord>;

/**
 * Read the encrypted integrations sync cookie and hydrate any missing records in SQLite
 * so all serverless instances always see the exact same connected integrations.
 */
export async function hydrateIntegrationsFromCookie(): Promise<void> {
  try {
    const cookieStore = cookies();
    const rawCookie = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawCookie) return;

    const map = decrypt<SyncMap>(rawCookie);
    if (!map || typeof map !== 'object') return;

    const dbRows = await prisma.integration.findMany();

    for (const [provider, rec] of Object.entries(map)) {
      if (!rec || rec.s !== 'connected') continue;
      const catalogItem = INTEGRATIONS_CATALOG.find((c) => c.id === provider);
      if (!catalogItem && provider !== 'google_oauth_app') continue;

      const existing = dbRows.find((r) => r.provider === provider);
      if (!existing || existing.status !== 'connected' || !existing.encryptedData) {
        await prisma.integration.upsert({
          where: { provider },
          create: {
            provider,
            status: 'connected',
            accountEmail: rec.e || null,
            encryptedData: rec.d || null,
            settings: catalogItem?.defaultSettings || {},
            allowedTools: catalogItem ? catalogItem.tools.map((t) => t.id) : [],
            lastSyncAt: new Date()
          },
          update: {
            status: 'connected',
            accountEmail: rec.e || null,
            encryptedData: rec.d || null,
            lastSyncAt: new Date()
          }
        });
      }
    }
  } catch {}
}

/**
 * Build an updated encrypted cookie value from the current database state merged with existing cookie state
 */
export async function buildIntegrationsSyncCookieValue(
  overrideUpdates?: Record<string, CompactIntegrationRecord | null>
): Promise<string> {
  let currentMap: SyncMap = {};
  try {
    const cookieStore = cookies();
    const rawCookie = cookieStore.get(COOKIE_NAME)?.value;
    if (rawCookie) {
      const parsed = decrypt<SyncMap>(rawCookie);
      if (parsed && typeof parsed === 'object') {
        currentMap = { ...parsed };
      }
    }
  } catch {}

  const dbRows = await prisma.integration.findMany();
  for (const row of dbRows) {
    if (row.status === 'connected' && row.encryptedData) {
      currentMap[row.provider] = {
        s: 'connected',
        e: row.accountEmail || null,
        d: row.encryptedData
      };
    }
  }

  if (overrideUpdates) {
    for (const [prov, val] of Object.entries(overrideUpdates)) {
      if (val === null) {
        delete currentMap[prov];
      } else {
        currentMap[prov] = val;
      }
    }
  }

  return encrypt(currentMap);
}

export const INTEGRATIONS_COOKIE_NAME = COOKIE_NAME;
