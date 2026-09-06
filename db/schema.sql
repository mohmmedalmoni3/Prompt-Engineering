-- ============================================================
-- PROMPT ENGINEERING Workshop — Registration table (Neon/Postgres)
-- Run this once in your Neon SQL editor (https://neon.tech → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  field TEXT NOT NULL,
  experience TEXT NOT NULL CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  motivation TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlist')),
  device_hash TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_city ON registrations (city);
CREATE INDEX IF NOT EXISTS idx_registrations_device ON registrations (device_hash);

-- ============================================================
-- Workshop settings — e.g. open/close registration from admin
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Registration is open by default ('true' | 'false')
INSERT INTO settings (key, value)
VALUES ('registration_open', 'true')
ON CONFLICT (key) DO NOTHING;