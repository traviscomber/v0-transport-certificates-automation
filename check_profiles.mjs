import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name, role')
    .in('email', ['ocarrasco@labbe.cl', 'jayala@labbe.cl', 'dsilva@labbe.cl'])

  console.log('=== PROFILES TABLE ===')
  if (error) console.log('Error:', error.message)
  else if (data && data.length > 0) {
    data.forEach(p => console.log(`${p.email}: ${p.role}`))
  } else {
    console.log('No users found in profiles table')
  }
}

check()
