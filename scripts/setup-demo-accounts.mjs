import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[v0] Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_ACCOUNTS = [
  {
    email: 'conductor@demo.cl',
    password: 'demo123',
    role: 'driver',
    name: 'Conductor Demo',
  },
  {
    email: 'despachador@demo.cl',
    password: 'demo123',
    role: 'dispatcher',
    name: 'Despachador Demo',
  },
  {
    email: 'admin@demo.cl',
    password: 'demo123',
    role: 'admin',
    name: 'Admin Demo',
  },
]

async function setupDemoAccounts() {
  console.log('[v0] Starting demo account setup...')

  for (const account of DEMO_ACCOUNTS) {
    try {
      console.log(`[v0] Processing ${account.email}...`)

      // Try to delete existing user first (if any)
      try {
        await supabase.auth.admin.deleteUser(account.email)
        console.log(`[v0] Deleted existing user ${account.email}`)
      } catch (e) {
        // User doesn't exist yet, that's fine
      }

      // Create new user with admin API
      const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.name,
          role: account.role,
        },
      })

      if (createError) {
        console.error(`[v0] Failed to create user ${account.email}:`, createError)
        continue
      }

      console.log(`[v0] Created user ${account.email} with ID ${user?.user?.id}`)

      // Create or update profile
      if (user?.user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.user.id,
            email: account.email,
            full_name: account.name,
            role: account.role,
            company_name: 'Demo Company',
          })

        if (profileError) {
          console.error(`[v0] Failed to create profile for ${account.email}:`, profileError)
        } else {
          console.log(`[v0] Created profile for ${account.email}`)
        }
      }
    } catch (error: any) {
      console.error(`[v0] Error processing ${account.email}:`, error.message)
    }
  }

  console.log('[v0] Demo account setup complete!')

  // Verify accounts exist
  console.log('\n[v0] Verifying demo accounts...')
  for (const account of DEMO_ACCOUNTS) {
    try {
      const { data: user, error } = await supabase.auth.admin.getUserByEmail(account.email)
      if (error) {
        console.error(`[v0] ✗ ${account.email} - NOT FOUND`)
      } else {
        console.log(`[v0] ✓ ${account.email} - ID: ${user.user?.id}`)
      }
    } catch (e: any) {
      console.error(`[v0] Error checking ${account.email}:`, e.message)
    }
  }
}

setupDemoAccounts().catch(console.error)
