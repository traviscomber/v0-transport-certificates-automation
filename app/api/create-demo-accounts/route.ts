import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_ACCOUNTS = [
  { email: 'conductor@demo.cl', password: 'demo123', role: 'driver', name: 'Conductor Demo' },
  { email: 'despachador@demo.cl', password: 'demo123', role: 'dispatcher', name: 'Despachador Demo' },
  { email: 'admin@demo.cl', password: 'demo123', role: 'admin', name: 'Admin Demo' },
]

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase not configured', success: false },
        { status: 500 }
      )
    }

    // Create admin client for auth operations
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const results = []

    for (const account of DEMO_ACCOUNTS) {
      try {
        // First, check if user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(account.email)
        
        if (existingUser?.user) {
          results.push({
            email: account.email,
            success: true,
            message: 'User already exists',
          })
          continue
        }

        // Create user via auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.name,
            role: account.role,
          },
        })

        if (authError) {
          results.push({
            email: account.email,
            success: false,
            error: authError.message,
          })
          continue
        }

        // Create profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser?.user?.id,
            email: account.email,
            full_name: account.name,
            role: account.role,
            company_name: 'Demo Company',
          })

        if (profileError) {
          results.push({
            email: account.email,
            success: false,
            error: `Profile creation failed: ${profileError.message}`,
          })
        } else {
          results.push({
            email: account.email,
            success: true,
            message: 'Account created successfully',
          })
        }
      } catch (error: any) {
        results.push({
          email: account.email,
          success: false,
          error: error.message,
        })
      }
    }

    const allSuccess = results.every(r => r.success)
    return NextResponse.json(
      {
        success: allSuccess,
        message: allSuccess ? 'All demo accounts created' : 'Some accounts failed',
        results,
      },
      { status: allSuccess ? 200 : 207 }
    )
  } catch (error: any) {
    console.error('[v0] Error in create-demo-accounts:', error)
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    )
  }
}
