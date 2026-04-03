#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_ACCOUNTS = [
  {
    email: 'conductor@demo.cl',
    password: 'demo123',
    name: 'Conductor Demo',
    role: 'driver',
  },
  {
    email: 'despachador@demo.cl',
    password: 'demo123',
    name: 'Despachador Demo',
    role: 'dispatcher',
  },
  {
    email: 'admin@demo.cl',
    password: 'demo123',
    name: 'Admin Demo',
    role: 'admin',
  },
]

async function setupDemoUsers() {
  try {
    console.log('[v0] Starting demo user creation...')

    for (const account of DEMO_ACCOUNTS) {
      try {
        console.log(`[v0] Creating user: ${account.email}`)

        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.name,
            role: account.role,
          },
        })

        if (error) {
          console.error(`[v0] Error creating ${account.email}:`, error.message)
          continue
        }

        console.log(`[v0] Successfully created ${account.email} with ID: ${data.user?.id}`)

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user?.id,
            email: account.email,
            full_name: account.name,
            role: account.role,
            company_name: 'Demo Company',
          })

        if (profileError) {
          console.error(`[v0] Error creating profile for ${account.email}:`, profileError.message)
        } else {
          console.log(`[v0] Profile created for ${account.email}`)
        }
      } catch (err) {
        console.error(`[v0] Exception for ${account.email}:`, err.message)
      }
    }

    console.log('[v0] ✓ Demo user setup complete!')
    process.exit(0)
  } catch (error) {
    console.error('[v0] Fatal error:', error.message)
    process.exit(1)
  }
}

setupDemoUsers()
