import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Server-side Supabase client for use in Server Components and API routes.
 * Creates a new client on each request to avoid state issues with Fluid compute.
 */
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase URL or Key. Please check your environment variables.")
  }

  return createClient(url, key)
}

export { createServerClient }
