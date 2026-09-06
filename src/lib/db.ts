/* eslint-disable no-underscore-dangle */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var __neon: NeonQueryFunction<false, false> | undefined;
}

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // Return a query function that fails gracefully with a clear message.
    // This keeps the app bootable (builds, admin login) before Neon is configured.
    return (async (..._args: unknown[]) => {
      throw new Error(
        'DATABASE_URL is not set. Add your Neon PostgreSQL connection string to .env.local'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as unknown as NeonQueryFunction<false, false>;
  }

  return neon(databaseUrl);
}

// Reuse a single connection across hot reloads in development
export const sql = globalThis.__neon ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__neon = sql;
}