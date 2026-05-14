import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkConductorPasswords() {
  const { data, error } = await supabase
    .from('conductor_auth')
    .select('rut, password_hash')
    .limit(3)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  for (const record of data) {
    const rutClean = record.rut.replace(/[.\-]/g, '')
    const format1 = 'labbe' + rutClean.slice(-4) // Con verificador
    const format2 = 'labbe' + rutClean.slice(-5, -1) // Sin verificador
    
    const match1 = await bcrypt.compare(format1, record.password_hash)
    const match2 = await bcrypt.compare(format2, record.password_hash)
    
    console.log(`${record.rut}: con_verif=${format1}(${match1}) sin_verif=${format2}(${match2})`)
  }
}

checkConductorPasswords()
