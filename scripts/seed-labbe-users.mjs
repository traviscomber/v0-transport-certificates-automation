import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const executives = [
  {
    email: 'olga@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Olga Lydia Carrasco Olivares',
    rut: '14.156.425-1'
  },
  {
    email: 'carolina@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Carolina Sepulveda',
    rut: '15.234.567-8'
  },
  {
    email: 'daniela@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Daniela Silva',
    rut: '16.345.678-9'
  },
  {
    email: 'cecilia@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Cecilia Farias',
    rut: '17.456.789-0'
  },
  {
    email: 'diego@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Diego Gonzalez',
    rut: '18.567.890-1'
  },
  {
    email: 'katherinne@transporteslabbe.cl',
    password: 'labbe2024',
    full_name: 'Katherinne Canales',
    rut: '19.678.901-2'
  }
]

async function seedUsers() {
  console.log('[v0] Starting to create users...')

  for (const exec of executives) {
    try {
      console.log(`[v0] Creating user: ${exec.full_name}`)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: exec.email,
        password: exec.password,
        email_confirm: true
      })

      if (authError) {
        console.error(`[v0] Error creating auth user for ${exec.email}:`, authError.message)
        continue
      }

      console.log(`[v0] Auth user created: ${authData.user.id}`)

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: exec.email,
          full_name: exec.full_name,
          role: 'executive',
          company_name: 'Transportes Labbe',
          is_active: true
        })

      if (profileError) {
        console.error(`[v0] Error creating profile for ${exec.email}:`, profileError.message)
      } else {
        console.log(`[v0] ✓ User created successfully: ${exec.full_name}`)
      }
    } catch (error) {
      console.error(`[v0] Unexpected error for ${exec.email}:`, error)
    }
  }

  console.log('[v0] Seed complete! All users should be created.')
  console.log('[v0] You can now login with:')
  executives.forEach(exec => {
    console.log(`  - Email: ${exec.email}, Password: labbe2024`)
  })
}

seedUsers()
