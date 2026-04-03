import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_ACCOUNTS = [
  {
    email: 'conductor@demo.cl',
    password: 'demo123',
    full_name: 'Conductor Demo',
    role: 'driver',
  },
  {
    email: 'despachador@demo.cl',
    password: 'demo123',
    full_name: 'Despachador Demo',
    role: 'dispatcher',
  },
  {
    email: 'admin@demo.cl',
    password: 'demo123',
    full_name: 'Admin Demo',
    role: 'admin',
  },
]

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const results = []

    for (const account of DEMO_ACCOUNTS) {
      try {
        console.log(`[v0] Creating demo user: ${account.email}`)

        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name,
            role: account.role,
          },
        })

        if (error) {
          console.error(`[v0] Error creating ${account.email}:`, error)
          results.push({
            email: account.email,
            success: false,
            error: error.message,
          })
        } else {
          console.log(`[v0] Successfully created ${account.email}`, data.user?.id)
          
          // Also create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user?.id,
              email: account.email,
              full_name: account.full_name,
              role: account.role,
              company_name: 'Demo Company',
            })

          if (profileError) {
            console.error(`[v0] Error creating profile for ${account.email}:`, profileError)
            results.push({
              email: account.email,
              success: false,
              error: `User created but profile failed: ${profileError.message}`,
            })
          } else {
            results.push({
              email: account.email,
              success: true,
              message: 'User and profile created successfully',
            })
          }
        }
      } catch (error: any) {
        console.error(`[v0] Exception creating ${account.email}:`, error)
        results.push({
          email: account.email,
          success: false,
          error: error.message,
        })
      }
    }

    const allSuccess = results.every(r => r.success)
    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? 'All demo users created' : 'Some users failed to create',
      results,
    }, { status: allSuccess ? 200 : 207 })
  } catch (error: any) {
    console.error('[v0] Error in setup/create-demo-users:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
