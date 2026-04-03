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
      console.error('[v0] Missing Supabase env vars')
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
        // Try to create user via auth - if exists, catch the error and treat as success
        console.log(`[v0] Creating/checking user ${account.email}`)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.name,
            role: account.role,
          },
        })

        console.log(`[v0] Create auth response for ${account.email}:`, { userId: authUser?.user?.id, authError })

        // If user already exists, query the database to get the ID
        let userId = authUser?.user?.id
        if (authError && authError.message?.includes('already exists')) {
          console.log(`[v0] ${account.email} already exists, fetching from database`)
          // User already exists, get from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', account.email)
            .single()
          userId = profile?.id
        } else if (authError) {
          console.error(`[v0] Auth error for ${account.email}:`, authError)
          results.push({
            email: account.email,
            success: false,
            error: authError.message,
          })
          continue
        }

        if (!userId) {
          results.push({
            email: account.email,
            success: false,
            error: 'Could not get user ID',
          })
          continue
        }

        // Create or update profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: account.email,
            full_name: account.name,
            role: account.role,
            company_name: 'Demo Company',
          })

        console.log(`[v0] Profile upsert for ${account.email}:`, { error: profileError })

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
            message: authError ? 'User already existed' : 'Account created successfully',
          })
        }
      } catch (error: any) {
        console.error(`[v0] Exception for ${account.email}:`, error)
        results.push({
          email: account.email,
          success: false,
          error: error.message,
        })
      }
    }

    const allSuccess = results.every(r => r.success)
    console.log(`[v0] Demo account creation complete:`, { allSuccess, results })
    
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
