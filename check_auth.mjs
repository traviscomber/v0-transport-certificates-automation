import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAuth() {
  // Check if RUT exists in transportista_auth
  const { data: authData, error: authError } = await supabase
    .from('transportista_auth')
    .select('id, rut, is_active, transportista_id')
    .eq('rut', '78129079-3')
    .maybeSingle()

  console.log('\n=== TRANSPORTISTA_AUTH ===')
  if (authError) console.log('Error:', authError.message)
  else if (authData) console.log('Found:', authData)
  else console.log('NOT FOUND for RUT 78129079-3')

  // Check a few recent records
  const { data: recentAuth } = await supabase
    .from('transportista_auth')
    .select('id, rut, is_active')
    .limit(5)
  
  console.log('\n=== RECENT TRANSPORTISTA_AUTH RECORDS ===')
  recentAuth?.forEach(r => console.log(r))

  // Also check conductor_auth
  const { data: condAuth, error: condError } = await supabase
    .from('conductor_auth')
    .select('id, rut, is_active')
    .limit(3)
  
  console.log('\n=== CONDUCTOR_AUTH RECORDS ===')
  if (condError) console.log('Error:', condError.message)
  else condAuth?.forEach(r => console.log(r))
}

checkAuth()
