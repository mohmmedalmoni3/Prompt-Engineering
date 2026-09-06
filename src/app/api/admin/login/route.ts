import { setAdminSession, verifyAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (per IP). Resets on cold start; enough
// protection for a workshop signup app without external services.
const attempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 8;
const LOCK_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();

  const record = attempts.get(ip);
  if (record && record.lockedUntil > now) {
    const minutes = Math.ceil((record.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `تم قفل المحاولة مؤقتاً. حاول بعد ${minutes} دقيقة` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);

  const { username, password } = (body ?? {}) as { username?: string; password?: string };

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'أدخل اسم المستخدم وكلمة المرور' }, { status: 400 });
  }

  if (username.length > 128 || password.length > 256) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  if (!verifyAdmin(username, password)) {
    const current = attempts.get(ip);
    const count = (current?.count ?? 0) + 1;

    if (count >= MAX_ATTEMPTS) {
      attempts.set(ip, { count, lockedUntil: now + LOCK_MS });
      return NextResponse.json(
        { error: 'محاولات كثيرة فاشلة. تم القفل مؤقتاً' },
        { status: 429 }
      );
    }

    attempts.set(ip, { count, lockedUntil: 0 });
    return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
  }

  attempts.delete(ip);

  await setAdminSession();

  return NextResponse.json({ success: true });
}