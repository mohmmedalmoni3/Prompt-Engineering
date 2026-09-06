import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Admin-only — toggles workshop registration open/closed.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'غير مصرح به' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const open = (body as { open?: unknown } | null)?.open === true;

  try {
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('registration_open', ${open ? 'true' : 'false'})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    return NextResponse.json({ success: true, open });
  } catch {
    return NextResponse.json({ error: 'تعذر تحديث الحالة' }, { status: 500 });
  }
}