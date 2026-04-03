import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return existing client if already created
  if (client) {
    return client
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[v0] Missing Supabase config:', { hasUrl: !!url, hasKey: !!key })
    throw new Error("Missing Supabase URL or Key. Please check your environment variables.")
  }

  console.log('[v0] Supabase client initialized with URL:', url.substring(0, 20) + '...')

  // Create and cache the client
  client = createSupabaseClient(url, key)
  return client
}
