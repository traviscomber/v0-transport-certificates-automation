function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export function isMissingSupabaseConfigError(error: unknown) {
  const message = getErrorMessage(error)
  return (
    message.includes('Missing NEXT_PUBLIC_SUPABASE_URL') ||
    message.includes('Missing SUPABASE_SERVICE_ROLE_KEY') ||
    message.includes('Missing Supabase URL') ||
    message.includes('Missing Supabase API key') ||
    message.includes('Supabase credentials not configured')
  )
}

export function logSupabaseError(prefix: string, error: unknown) {
  if (isMissingSupabaseConfigError(error)) return
  console.error(prefix, error)
}
