import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'atiende-auth-secret-change-me-in-production-2026'
);

export async function createSessionToken(payload: { userId: string; email: string; name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('atiende_session')?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: 'admin'
  };
}
