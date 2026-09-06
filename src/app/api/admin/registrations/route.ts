import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface RegistrationRow {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  field: string;
  experience: string;
  motivation: string;
  created_at: string;
}

interface StatsRow {
  total: string;
  today: string;
  week: string;
  cities: string;
  pending: string;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search')?.trim().toLowerCase() ?? '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 200), 1), 500);
  const offset = Math.max(Number(searchParams.get('offset') ?? 0), 0);

  try {
    const rows = await sql`
      SELECT id, full_name, email, phone, city, field, experience, motivation, created_at
      FROM registrations
      WHERE ${search === '' ? sql`TRUE` : sql`(
        LOWER(full_name) LIKE ${`%${search}%`}
        OR LOWER(email) LIKE ${`%${search}%`}
        OR LOWER(phone) LIKE ${`%${search}%`}
        OR LOWER(city) LIKE ${`%${search}%`}
        OR LOWER(field) LIKE ${`%${search}%`}
      )`}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const stats = await sql`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::text AS today,
        COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS week,
        COUNT(DISTINCT city)::text AS cities,
        COUNT(*) FILTER (WHERE status = 'pending')::text AS pending
      FROM registrations
    `;

    const s = stats[0] as StatsRow | undefined;

    const setting = await sql`SELECT value FROM settings WHERE key = 'registration_open'`;
    const registrationOpen = setting[0]?.value !== 'false';

    return NextResponse.json({
      registrations: rows as RegistrationRow[],
      stats: {
        total: Number(s?.total ?? 0),
        today: Number(s?.today ?? 0),
        week: Number(s?.week ?? 0),
        cities: Number(s?.cities ?? 0),
        pending: Number(s?.pending ?? 0)
      },
      registrationOpen
    });
  } catch {
    return NextResponse.json({ error: 'تعذر تحميل البيانات' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = Number(searchParams.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
  }

  try {
    await sql`DELETE FROM registrations WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'تعذر حذف السجل' }, { status: 500 });
  }
}