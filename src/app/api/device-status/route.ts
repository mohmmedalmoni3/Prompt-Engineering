import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Public endpoint — tells whether THIS device (by its fingerprint hash)
// has an actual registration in the database.
// Prevents stale client-side markers from falsely blocking the form.
export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('h')?.trim() ?? '';

  if (!hash || hash.length > 100) {
    return NextResponse.json({ registered: false });
  }

  try {
    const rows = await sql`SELECT id FROM registrations WHERE device_hash = ${hash}`;
    return NextResponse.json({
      registered: (rows as { id: number }[]).length > 0
    });
  } catch {
    // Fail-open: if the DB is unavailable, let the visitor try the form
    return NextResponse.json({ registered: false });
  }
}