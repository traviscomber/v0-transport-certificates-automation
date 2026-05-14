import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyPassword() {
  // Get password hash for RUT 78129079-3
  const { data, error } = await supabase
    .from('transportista_auth')
    .select('id, rut, password_hash')
    .eq('rut', '78129079-3')
    .single()

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('RUT:', data.rut)
  console.log('Hash exists:', !!data.password_hash)
  console.log('Hash length:', data.password_hash?.length)

  // Test expected password (labbe + last 4 digits)
  const expectedPassword = 'labbe9079'
  const matches = await bcrypt.compare(expectedPassword, data.password_hash)
  console.log('\nExpected password:', expectedPassword)
  console.log('Password matches:', matches)

  // Also test some variations
  const variations = ['labbe79-3', 'labbe0793', '9079', 'labbe9079-3']
  for (const v of variations) {
    const m = await bcrypt.compare(v, data.password_hash)
    console.log(`Testing "${v}":`, m)
  }
}

verifyPassword()
