/**
 * Runtime env validation. Imported by code paths that require Supabase.
 * Throws fast with a clear message in dev if vars are missing.
 */
const required = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export function assertEnv() {
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(", ")}. Add them to .env.local.`
    );
  }
}
