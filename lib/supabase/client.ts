import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return cached instance if already created
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[v0] Missing Supabase environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      key: supabaseAnonKey ? 'SET' : 'MISSING',
    })
    return null
  }

  console.log('[v0] Creating Supabase client with URL:', supabaseUrl)

  clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
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

  return clientInstance
}
