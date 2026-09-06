import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'الاسم الكامل مطلوب (حرفان على الأقل)')
    .max(80, 'الاسم طويل جداً'),
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?962|0)7\d{8}$/, 'أدخل رقم أردني صحيح (07XXXXXXXX)'),
  city: z.string().trim().min(2, 'المحافظة مطلوبة').max(60),
  field: z.string().trim().min(2, 'المجال مطلوب').max(60),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  motivation: z.string().trim().max(500).optional().default('')
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'بيانات غير صالحة';
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { fullName, email, phone, city, field, experience, motivation } = parsed.data;
  // Normalize phone for duplicate checks: 0791234567, 962791234567, +962791234567 → 962791234567
  const normalizedPhone = phone.startsWith('0')
    ? '962' + phone.slice(1)
    : phone.replace(/^\+/, '');

  try {
    const setting = await sql`SELECT value FROM settings WHERE key = 'registration_open'`;
    const open = setting[0]?.value !== 'false';

    if (!open) {
      return NextResponse.json(
        { error: 'عذراً، تم إغلاق التسجيل في الورشة حالياً' },
        { status: 403 }
      );
    }

    const existing = await sql`SELECT id FROM registrations WHERE email = ${email}`;

    if ((existing as { id: number }[]).length > 0) {
      return NextResponse.json(
        { error: 'هذا البريد مسجّل مسبقاً في الورشة' },
        { status: 409 }
      );
    }

    // Same phone number can only register once (checks normalized form)
    const phoneExists =
      await sql`SELECT id FROM registrations WHERE phone = ${phone} OR phone = ${normalizedPhone}`;

    if ((phoneExists as { id: number }[]).length > 0) {
      return NextResponse.json(
        { error: 'هذا الرقم مسجّل مسبقاً في الورشة' },
        { status: 409 }
      );
    }

    const rows = await sql`
      INSERT INTO registrations (full_name, email, phone, city, field, experience, motivation)
      VALUES (${fullName}, ${email}, ${normalizedPhone}, ${city}, ${field}, ${experience}, ${motivation})
      RETURNING id, created_at
    `;

    const created = rows[0] as { id: number; created_at: string };

    return NextResponse.json(
      { success: true, id: created.id, registeredAt: created.created_at },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الحفظ. حاول مرة أخرى' },
      { status: 500 }
    );
  }
}