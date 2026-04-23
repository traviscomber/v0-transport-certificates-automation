import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const usuarios = [
  {
    email: 'olga.carrasco@transporteslabbe.cl',
    full_name: 'Olga Lydia Carrasco Olivares',
    rut: '10574005-0',
    phone: '+56977764753',
  },
  {
    email: 'carolina.sepulveda@transporteslabbe.cl',
    full_name: 'Carolina Pilar Sepulveda Contreras',
    rut: '15464094-0',
    phone: '+56950067666',
  },
  {
    email: 'daniela.silva@transporteslabbe.cl',
    full_name: 'Daniela Constanza Silva Rojas',
    rut: '17768246-2',
    phone: '+56978540722',
  },
  {
    email: 'cecilia.farias@transporteslabbe.cl',
    full_name: 'Cecilia Del Carmen Farias Muñoz',
    rut: '9888992-2',
    phone: '+56978540798',
  },
  {
    email: 'diego.gonzalez@transporteslabbe.cl',
    full_name: 'Diego Andres Gonzalez Valenzuela',
    rut: '20114106-0',
    phone: '+56978455527',
  },
  {
    email: 'katherinne.canales@transporteslabbe.cl',
    full_name: 'Katherinne Johanna Canales Hernandez',
    rut: '18717311-6',
    phone: '+56956139744',
  },
]

async function insertUsuarios() {
  try {
    console.log('[v0] Starting user insertion...')

    // Step 1: Get Transportes Labbe organization ID
    console.log('[v0] Fetching Transportes Labbe organization...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Transportes Labbe')
      .single()

    if (orgError || !org) {
      console.error('[v0] Error fetching organization:', orgError?.message)
      process.exit(1)
    }

    const organizationId = org.id
    console.log('[v0] Found organization ID:', organizationId)

    // Step 2: Insert users
    console.log('[v0] Inserting', usuarios.length, 'users...')

    const { data, error } = await supabase
      .from('profiles')
      .insert(
        usuarios.map((u) => ({
          email: u.email,
          full_name: u.full_name,
          rut: u.rut,
          phone: u.phone,
          role: 'admin',
          is_active: true,
          organization_id: organizationId,
        }))
      )
      .select()

    if (error) {
      console.error('[v0] Error inserting users:', error.message)
      process.exit(1)
    }

    console.log('[v0] ✅ Successfully inserted', data.length, 'users')
    console.log('[v0] Users:')
    data.forEach((u) => {
      console.log(`  - ${u.full_name} (${u.rut}): ${u.email}`)
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    process.exit(1)
  }
}

insertUsuarios()
