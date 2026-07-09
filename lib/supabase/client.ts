import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return cached instance if already created
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    // Create a dummy client to avoid null checks everywhere
    // This will fail at runtime but won't cause TypeScript errors
    clientInstance = createSupabaseClient('https://dummy.supabase.co', 'dummy-key', {
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
    })
    return clientInstance
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[v0] Creating Supabase client with URL:', supabaseUrl)
  }

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
  })

  return clientInstance
}
