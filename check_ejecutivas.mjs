import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkEjecutivas() {
  // Get all ejecutivas
  const { data, error } = await supabase
    .from('executive_staff')
    .select('id, full_name, email, is_active')
    .eq('is_active', true)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('=== EJECUTIVAS ACTIVAS ===')
  data?.forEach(e => {
    console.log(`${e.full_name}: ${e.email}`)
  })

  // Also check profiles table for any ejecutivas
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, full_name, role')
    .eq('role', 'ejecutiva')

  if (profiles && profiles.length > 0) {
    console.log('\n=== EJECUTIVAS EN PROFILES ===')
    profiles.forEach(p => {
      console.log(`${p.full_name}: ${p.email}`)
    })
  }
}

checkEjecutivas()
