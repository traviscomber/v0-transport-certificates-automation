import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAuthDates() {
  const { data, error } = await supabase
    .from('transportista_auth')
    .select('rut, created_at, last_login')
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('\n=== ÚLTIMOS REGISTROS TRANSPORTISTA_AUTH ===')
  if (error) console.log('Error:', error.message)
  else data?.forEach(r => console.log(`${r.rut} - Creado: ${r.created_at} - Último login: ${r.last_login || 'nunca'}`))
}

checkAuthDates()
