import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client using the service_role key.
 *
 * Bypasses Row Level Security — use only in trusted server contexts
 * (server actions, route handlers) and only after verifying the caller
 * is an admin / principal via getCurrentProfile().
 *
 * Never import this from a Client Component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Admin client unavailable: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
