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

    // Step 2: Create auth users and profiles
    console.log('[v0] Creating', usuarios.length, 'auth users and profiles...')

    const createdUsers = []
    let successCount = 0
    let errorCount = 0

    for (const u of usuarios) {
      try {
        console.log(`[v0] Processing: ${u.email}`)

        // Create auth user with admin API
        console.log(`[v0] Creating auth user for ${u.email}...`)
        let userId
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: 'TempPassword123!',
            email_confirm: true,
          })

          if (authError) {
            console.error(`[v0] Auth error for ${u.rut}:`, authError?.message || authError)
            errorCount++
            continue
          }

          if (!authData?.user?.id) {
            console.error(`[v0] No user ID returned for ${u.rut}`, authData)
            errorCount++
            continue
          }

          userId = authData.user.id
          console.log(`[v0] ✅ Created auth user ${userId} for ${u.email}`)
        } catch (authErr) {
          console.error(`[v0] Exception creating auth user for ${u.rut}:`, authErr?.message)
          errorCount++
          continue
        }

        // Create profile with the auth user ID
        console.log(`[v0] Creating profile for user ${userId}...`)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
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
          console.error(`[v0] Profile error for ${u.rut} (${userId}):`, profileError?.message || profileError)
          errorCount++
          continue
        }

        createdUsers.push(profileData)
        successCount++
        console.log(`[v0] ✅ Created profile for ${u.full_name} (${u.rut})`)
      } catch (err) {
        console.error(`[v0] Exception for ${u.rut}:`, err?.message)
        errorCount++
      }
    }

        if (!authData || !authData.user) {
          console.error(`[v0] No user returned for ${u.rut}`)
          errorCount++
          continue
        }

        const userId = authData.user.id
        console.log(`[v0] ✅ Created auth user ${userId} for ${u.email}`)

        // Create profile with the auth user ID
        console.log(`[v0] Creating profile for user ${userId}...`)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
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
          console.error(`[v0] Profile error for ${u.rut} (${userId}):`, profileError)
          errorCount++
          continue
        }

        createdUsers.push(profileData)
        successCount++
        console.log(`[v0] ✅ Created profile for ${u.full_name} (${u.rut})`)
      } catch (err) {
        console.error(`[v0] Error for ${u.rut} :`, err.message)
        errorCount++
      }
    }

    console.log(`[v0] ========== COMPLETE ==========`)
    console.log(`[v0] Success: ${successCount}, Errors: ${errorCount}`)
    console.log('[v0] Created users:')
    createdUsers.forEach((u) => {
      console.log(`  - ${u.full_name} (${u.rut}): ${u.email}`)
    })

    if (errorCount > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('[v0] Error:', err)
    process.exit(1)
  }
}

insertUsuarios()
