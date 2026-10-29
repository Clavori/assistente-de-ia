import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  // If running on Vercel without an external DB URL, use writable /tmp/dev.db seeded from prisma/dev.db
  if (process.env.VERCEL && (!envUrl || envUrl.startsWith('file:') || envUrl.includes('localhost'))) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db')
      ];
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch {}
        }
      }
    }
    return `file:${tmpDbPath}`;
  }
  return envUrl || 'file:./dev.db';
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
