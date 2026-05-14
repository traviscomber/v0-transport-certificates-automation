import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function comparePasswords() {
  // RUT que funcionó: 77941312-8
  // RUT que no funciona: 78129079-3
  
  const rutsToTest = ['77941312-8', '78129079-3']
  
  for (const rut of rutsToTest) {
    const { data, error } = await supabase
      .from('transportista_auth')
      .select('rut, password_hash')
      .eq('rut', rut)
      .single()

    if (error || !data) {
      console.log(`${rut}: NO ENCONTRADO`)
      continue
    }

    // Test both password formats
    const rutClean = rut.replace(/[.\-]/g, '')
    const format1 = 'labbe' + rutClean.slice(-4) // Incluyendo verificador
    const format2 = 'labbe' + rutClean.slice(-5, -1) // Sin verificador (antes del guion)
    
    const match1 = await bcrypt.compare(format1, data.password_hash)
    const match2 = await bcrypt.compare(format2, data.password_hash)
    
    console.log(`\n${rut}:`)
    console.log(`  Format 1 (con verificador): ${format1} -> ${match1 ? 'MATCH!' : 'no'}`)
    console.log(`  Format 2 (sin verificador): ${format2} -> ${match2 ? 'MATCH!' : 'no'}`)
  }
}

comparePasswords()
