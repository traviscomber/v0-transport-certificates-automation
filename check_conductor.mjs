import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkConductor() {
  const rut = '18012757-7'
  
  const { data, error } = await supabase
    .from('conductor_auth')
    .select('rut, password_hash')
    .eq('rut', rut)
    .single()

  if (error) {
    console.log('Error or not found:', error.message)
    return
  }

  const rutClean = rut.replace(/[.\-]/g, '')
  // Format 1: con verificador (last 4 of full RUT)
  const format1 = 'labbe' + rutClean.slice(-4)
  // Format 2: sin verificador (4 digits before verificador)
  const format2 = 'labbe' + rutClean.slice(-5, -1)
  
  const match1 = await bcrypt.compare(format1, data.password_hash)
  const match2 = await bcrypt.compare(format2, data.password_hash)
  
  console.log(`RUT: ${rut}`)
  console.log(`Format 1 (con verif): ${format1} -> ${match1 ? 'MATCH' : 'no'}`)
  console.log(`Format 2 (sin verif): ${format2} -> ${match2 ? 'MATCH' : 'no'}`)

  // Check a few more conductors
  const { data: sample } = await supabase
    .from('conductor_auth')
    .select('rut, password_hash')
    .limit(3)

  console.log('\n=== Sample conductors ===')
  for (const c of sample || []) {
    const clean = c.rut.replace(/[.\-]/g, '')
    const f1 = 'labbe' + clean.slice(-4)
    const f2 = 'labbe' + clean.slice(-5, -1)
    const m1 = await bcrypt.compare(f1, c.password_hash)
    const m2 = await bcrypt.compare(f2, c.password_hash)
    console.log(`${c.rut}: con_verif=${f1}(${m1}) sin_verif=${f2}(${m2})`)
  }
}

checkConductor()
