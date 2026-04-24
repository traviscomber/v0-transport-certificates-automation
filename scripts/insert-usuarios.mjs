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

    // Step 2: Check which users already have profiles
    console.log('[v0] Checking existing profiles...')
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('rut, email')

    const existingRuts = new Set(existingProfiles?.map(p => p.rut) || [])
    const existingEmails = new Set(existingProfiles?.map(p => p.email) || [])

    console.log(`[v0] Found ${existingProfiles?.length || 0} existing profiles`)

    // Step 3: Determine which usuarios need to be created
    const usuariosToCreate = usuarios.filter(u => !existingRuts.has(u.rut))
    
    if (usuariosToCreate.length === 0) {
      console.log('[v0] All usuarios already exist as profiles')
      return
    }

    console.log(`[v0] Need to create profiles for ${usuariosToCreate.length} usuarios`)
    console.log(`[v0]`)
    console.log(`[v0] IMPORTANT: Auth users must already exist for these emails.`)
    console.log(`[v0] If they don't exist, first create them via /api/admin/seed-labbe-users`)
    console.log(`[v0]`)

    // Step 4: Try to create profiles for each usuario
    let successCount = 0
    let errorCount = 0
    const needsAuthUser = []

    for (const u of usuariosToCreate) {
      try {
        console.log(`[v0] Creating profile for ${u.email}...`)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: u.email,
            full_name: u.full_name,
            rut: u.rut,
            phone: u.phone,
            role: 'admin',
            is_active: true,
            organization_id: organizationId,
          })
          .select()
          .single()

        if (profileError) {
          if (profileError.message.includes('violates foreign key')) {
            console.error(`[v0] ⚠️  Auth user missing for ${u.email}`)
            needsAuthUser.push(u)
            errorCount++
          } else {
            console.error(`[v0] Error for ${u.rut}:`, profileError.message)
            errorCount++
          }
          continue
        }

        successCount++
        console.log(`[v0] ✅ Created profile for ${u.full_name} (${u.rut})`)
      } catch (err) {
        console.error(`[v0] Exception for ${u.rut}:`, err?.message)
        errorCount++
      }
    }

    console.log(`[v0]`)
    console.log(`[v0] ========== COMPLETE ==========`)
    console.log(`[v0] Success: ${successCount}, Errors: ${errorCount}`)

    if (needsAuthUser.length > 0) {
      console.log(`[v0]`)
      console.log(`[v0] ${needsAuthUser.length} usuarios need auth users created first:`)
      needsAuthUser.forEach(u => {
        console.log(`[v0]   - ${u.email} (${u.rut})`)
      })
      console.log(`[v0]`)
      console.log(`[v0] Create auth users by calling:`)
      console.log(`[v0] POST /api/admin/seed-labbe-users`)
      console.log(`[v0]`)
      console.log(`[v0] Then run this script again to create profiles.`)
    }

    if (errorCount > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('[v0] Error:', err)
    process.exit(1)
  }
}

insertUsuarios()
