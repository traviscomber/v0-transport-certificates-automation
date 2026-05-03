import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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

    // Get organization ID for Transportes Labbe
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

    // Get existing profiles to skip duplicates
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('rut')
    const existingRuts = new Set(existingProfiles?.map(p => p.rut) || [])

    let successCount = 0
    let errorCount = 0
    const createdUsers = []

    for (const u of usuarios) {
      try {
        // Skip if profile already exists
        if (existingRuts.has(u.rut)) {
          console.log(`[v0] ⏭️  Skipped ${u.email} - profile already exists`)
          continue
        }

        console.log(`[v0] Creating user: ${u.email}`)

        // Use the service role client to create auth users
        const { data, error: signUpError } = await supabase.auth.admin.createUser({
          email: u.email,
          password: 'TempPassword123!@',
          email_confirm: true,
          user_metadata: {
            full_name: u.full_name,
            phone: u.phone,
            rut: u.rut,
          },
        })

        if (signUpError) {
          console.error(`[v0] Error creating user ${u.email}:`, signUpError.message)
          errorCount++
          continue
        }

        const userId = data?.user?.id
        if (!userId) {
          console.error(`[v0] No user ID returned for ${u.email}`)
          errorCount++
          continue
        }

        console.log(`[v0] ✅ Created auth user: ${userId}`)

        // Now create the profile with the valid user ID
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
          console.error(`[v0] Error creating profile for ${u.email}:`, profileError.message)
          errorCount++
          continue
        }

        createdUsers.push(profileData)
        successCount++
        console.log(`[v0] ✅ Created profile for ${u.full_name}`)
      } catch (err) {
        console.error(`[v0] Exception for ${u.email}:`, err instanceof Error ? err.message : err)
        errorCount++
      }
    }

    console.log(`[v0]`)
    console.log(`[v0] ========== COMPLETE ==========`)
    console.log(`[v0] Success: ${successCount}, Errors: ${errorCount}`)
    if (createdUsers.length > 0) {
      console.log('[v0] Created users:')
      createdUsers.forEach((u) => {
        console.log(`  - ${u.full_name} (${u.rut}): ${u.email}`)
      })
    }

    if (errorCount > 0) {
      console.log(`[v0]`)
      console.log(`[v0] Some users failed to create. Check the errors above.`)
      process.exit(1)
    }
  } catch (err) {
    console.error('[v0] Fatal error:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

insertUsuarios()
