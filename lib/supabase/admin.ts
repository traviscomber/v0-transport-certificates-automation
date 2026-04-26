import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[v0] Creating admin client...')
  console.log('[v0] URL exists:', !!supabaseUrl)
  console.log('[v0] Service key exists:', !!supabaseServiceKey)
  console.log('[v0] Service key length:', supabaseServiceKey?.length || 0)
  console.log('[v0] URL:', supabaseUrl?.substring(0, 30) + '...')

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
    realtime: {
      enabled: false,  // Disable Realtime WebSocket for admin client
    },
  })

  console.log('[v0] Admin client created successfully')
  return client
}

