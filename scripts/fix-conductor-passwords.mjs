import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixPasswords() {
  console.log('Fixing conductor passwords to match instructions...')
  console.log('Format: labbe + últimos 4 dígitos ANTES del guion (sin verificador)')
  
  const { data: records, error } = await supabase
    .from('conductor_auth')
    .select('id, rut')

  if (error) {
    console.error('Error fetching records:', error)
    return
  }

  console.log(`Found ${records.length} records to check/update`)

  let updated = 0
  let alreadyCorrect = 0
  
  for (const record of records) {
    // Extract last 4 digits BEFORE the verificador
    // Remove dots and dashes, then get digits -5 to -1 (excluding last digit which is verificador)
    const rutClean = record.rut.replace(/[.\-]/g, '')
    const last4BeforeVerificador = rutClean.slice(-5, -1)
    const newPassword = 'labbe' + last4BeforeVerificador
    
    // Get current hash to check if already correct
    const { data: current } = await supabase
      .from('conductor_auth')
      .select('password_hash')
      .eq('id', record.id)
      .single()

    if (current) {
      const isCorrect = await bcrypt.compare(newPassword, current.password_hash)
      if (isCorrect) {
        alreadyCorrect++
        continue
      }
    }
    
    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 10)
    
    // Update in database
    const { error: updateError } = await supabase
      .from('conductor_auth')
      .update({ password_hash: hash })
      .eq('id', record.id)

    if (updateError) {
      console.error(`Error updating ${record.rut}:`, updateError.message)
    } else {
      updated++
      console.log(`Updated ${record.rut} -> ${newPassword}`)
    }
  }

  console.log(`\nDone! Updated ${updated} records, ${alreadyCorrect} were already correct`)
}

fixPasswords()
