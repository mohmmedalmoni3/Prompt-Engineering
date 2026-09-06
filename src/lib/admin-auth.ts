import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

// ---------------------------------------------------------------------------
// Password hashing (scrypt), stored as `salt:hash` in env
// ---------------------------------------------------------------------------

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');

  if (!salt || !hash) return false;

  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? '';

  return { username, passwordHash };
}

export function verifyAdmin(username: string, password: string): boolean {
  const { username: adminUser, passwordHash } = getAdminCredentials();

  if (!passwordHash) return false;

  return timingSafeEqual(
    Buffer.from(username),
    Buffer.from(adminUser)
  ) && verifyPassword(password, passwordHash);
}

// ---------------------------------------------------------------------------
// Session tokens (signed with HMAC-SHA256)
// ---------------------------------------------------------------------------

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

// Max length allowed for very explicit Buffer comparisons below
const MAX_USER_SAFE_LENGTH = 256;

export function createSessionToken(): { token: string; expiresAt: Date } {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is not set. Add it to .env.local');
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const exp = Math.floor(expiresAt.getTime() / 1000);
  const payload = Buffer.from(`${exp}`).toString('base64url');
  const signature = sign(payload, secret);

  return { token: `${payload}.${signature}`, expiresAt };
}

export async function setAdminSession() {
  const { token, expiresAt } = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
}

function safeEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return false;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  // Explicit length cap before Buffer comparisons
  if (payload.length > MAX_USER_SAFE_LENGTH || signature.length > MAX_USER_SAFE_LENGTH) {
    return false;
  }

  const expected = sign(payload, secret);
  if (!safeEqual(signature, expected)) return false;

  const decoded = Buffer.from(payload, 'base64url').toString('utf8');
  const exp = Number(decoded);

  if (!Number.isFinite(exp)) return false;

  return exp * 1000 > Date.now();
}

export function generatePasswordHash(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}