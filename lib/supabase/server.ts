import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Generic server-side Supabase client.
 *
 * This client intentionally uses the public anon key only. It must never
 * acquire service-role privileges implicitly. Application-authorized
 * privileged workflows must verify the server actor first and then use
 * createAdminClient() explicitly.
 *
 * The application currently uses its own signed `cf_session` actor contract,
 * so this client is not a substitute for that authorization layer.
 */
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Compatibility alias for existing server-only callers.
export const createClient = createServerClient
