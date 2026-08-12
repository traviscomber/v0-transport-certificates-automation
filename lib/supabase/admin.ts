import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Explicit privileged Supabase boundary.
 * Only use after server-side authorization or for trusted internal workflows.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
