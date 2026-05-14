import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUser() {
  // Check user in auth.users
  const { data, error } = await supabase.auth.admin.listUsers()
  
  const user = data?.users?.find(u => u.email === 'ocarrasco@labbe.cl')
  
  if (user) {
    console.log('\n=== USER INFO ===')
    console.log('Email:', user.email)
    console.log('Role (metadata):', user.user_metadata?.role)
    console.log('Full metadata:', JSON.stringify(user.user_metadata, null, 2))
  } else {
    console.log('User not found')
  }

  // Also check executive_staff
  const { data: execData, error: execError } = await supabase
    .from('executive_staff')
    .select('*')
    .eq('email', 'ocarrasco@labbe.cl')
    .maybeSingle()

  console.log('\n=== EXECUTIVE_STAFF ===')
  if (execData) {
    console.log('Found in executive_staff:', execData)
  } else {
    console.log('Not found in executive_staff')
  }
}

checkUser()
