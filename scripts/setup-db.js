// ============================================================
// Set up the Neon database schema.
//
// Usage:
//   node scripts/setup-db.js
//
// Reads DATABASE_URL from .env.local (or the environment),
// then runs db/schema.sql against your Neon database.
// ============================================================

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }

  return null;
}

async function main() {
  const databaseUrl = loadDatabaseUrl();

  if (!databaseUrl || databaseUrl.includes('YOUR_USERNAME')) {
    console.error('------------------------------------------------------------------------');
    console.error('DATABASE_URL not found.');
    console.error('1) Create a free database at https://neon.tech');
    console.error('2) Copy your connection string.');
    console.error('3) Set DATABASE_URL=your-string in .env.local  (or as an environment variable).');
    console.error('------------------------------------------------------------------------');
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const sql = neon(databaseUrl);

  console.log('Connecting to Neon...');

  try {
    // schema.sql contains multiple statements; neon() sends a single query,
    // so split on ";" boundaries that end a statement (naive but safe here).
    const statements = schema
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.query(statement);
    }

    console.log('Database ready! Tables created: registrations');
  } catch (err) {
    console.error('Failed to set up the database:');
    console.error(err);
    process.exit(1);
  }
}

main();