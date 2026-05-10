import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Admin Supabase Client
 * Used for server-side operations that require service role privileges
 * ✅ PRODUCTION READY - Alerts system unified and operational
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY



  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This is required for admin operations like creating users.")
  }

  const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },

  })

  return client
}

