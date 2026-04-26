import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Server-side Supabase client for use in Server Components and API routes.
 * Creates a new client on each request to avoid state issues with Fluid compute.
 * Uses SERVICE_ROLE_KEY for write operations on protected tables.
 */
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("Missing Supabase URL. Please check your environment variables.")
  }

  // Use service role key for server operations, fallback to anon key
  const key = serviceKey || anonKey
  
  if (!key) {
    throw new Error("Missing Supabase API key. Please check your environment variables.")
  }

  return createSupabaseClient(url, key, {
    realtime: {
      enabled: false,  // Disable Realtime WebSocket on server
    },
  })
}

// Re-export for compatibility with existing imports
export const createClient = createServerClient
