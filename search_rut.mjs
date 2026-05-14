import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check transportistas table
const { data: companies } = await supabase
  .from('transportistas')
  .select('rut, name')

console.log('RUTs starting with 7837:')
companies?.filter(c => c.rut.startsWith('7837')).forEach(c => {
  console.log(`  ${c.rut}: ${c.name}`)
})

console.log('\nRUTs starting with 7838:')
companies?.filter(c => c.rut.startsWith('7838')).forEach(c => {
  console.log(`  ${c.rut}: ${c.name}`)
})
