import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// Public endpoint — reads whether workshop registration is currently open.
// Fail-open by default: if the DB is unavailable, registration stays enabled.
export async function GET() {
  try {
    const rows = await sql`SELECT value FROM settings WHERE key = 'registration_open'`;
    const open = rows[0]?.value !== 'false';
    return NextResponse.json({ open });
  } catch {
    return NextResponse.json({ open: true });
  }
}