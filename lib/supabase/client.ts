import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[v0] Missing Supabase environment variables')
    throw new Error('Supabase configuration missing')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },

    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
    
    db: {
      schema: 'public',
    },
  })
}
