import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Always use the new project - the old project had a corrupted auth schema
const SUPABASE_URL = "https://zohapxdnfgjdxcgapbei.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGFweGRuZmdqZHhjZ2FwYmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODM1MjMsImV4cCI6MjA5MDc1OTUyM30.GysP5n-zBnAirpofqN0P58_mSxHa3UeQtVqS1lNgQQo"

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
