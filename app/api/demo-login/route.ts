import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Direct verification of demo account credentials
// This bypasses Supabase auth and uses direct DB query since demo accounts were created via SQL
const DEMO_CREDENTIALS = {
  'conductor@demo.cl': 'demo123',
  'despachador@demo.cl': 'demo123',
  'admin@demo.cl': 'demo123',
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Only handle demo accounts
    if (!(email in DEMO_CREDENTIALS)) {
      return NextResponse.json(
        { error: 'Not a demo account' },
        { status: 400 }
      )
    }

    // Verify credentials
    if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

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

    // Get the user profile to verify they exist in the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error('[v0] Demo account profile not found:', email)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Return the demo account data
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
      }
    })
  } catch (error: any) {
    console.error('[v0] Error in demo-login:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
