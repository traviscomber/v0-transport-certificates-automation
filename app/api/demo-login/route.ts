import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Demo account namespace for deterministic UUID generation
const DEMO_NAMESPACE = '550e8400-e29b-41d4-a716-446655440000'

// Function to generate deterministic UUID from email
function generateDemoUserId(email: string): string {
  const hash = createHash('md5').update(DEMO_NAMESPACE + email).digest('hex')
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

// Direct verification of demo account credentials
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

    // Get or create the user profile
    let profile = null
    
    // First try to get existing profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', email)
      .single()

    if (existingProfile) {
      profile = existingProfile
    } else if (profileError?.code === 'PGRST116') {
      // No rows found - create the profile with deterministic UUID
      console.log(`[v0] Creating missing profile for ${email}`)
      
      // Map email to role and name
      const roleMap: Record<string, { role: string; name: string }> = {
        'conductor@demo.cl': { role: 'driver', name: 'Conductor Demo' },
        'despachador@demo.cl': { role: 'dispatcher', name: 'Despachador Demo' },
        'admin@demo.cl': { role: 'admin', name: 'Admin Demo' },
      }
      
      const accountInfo = roleMap[email] || { role: 'user', name: 'Demo User' }
      
      // Generate deterministic UUID for this demo account
      const userId = generateDemoUserId(email)
      
      console.log(`[v0] Generated UUID for ${email}: ${userId}`)

      // Create the profile with deterministic ID
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: accountInfo.name,
          role: accountInfo.role,
          company_name: 'Demo Company',
        })
        .select('id, email, full_name, role')
        .single()

      if (createError || !newProfile) {
        console.error(`[v0] Failed to create profile for ${email}:`, createError)
        return NextResponse.json(
          { error: 'Could not create profile' },
          { status: 500 }
        )
      }
      
      profile = newProfile
    } else {
      console.error('[v0] Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Profile access error' },
        { status: 500 }
      )
    }

    if (!profile) {
      console.error('[v0] Demo account profile still not found:', email)
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
