import { NextResponse } from 'next/server'

// Direct verification of demo account credentials
const DEMO_CREDENTIALS = {
  'conductor@demo.cl': 'demo123',
  'despachador@demo.cl': 'demo123',
  'admin@demo.cl': 'demo123',
}

const DEMO_ROLES = {
  'conductor@demo.cl': 'driver',
  'despachador@demo.cl': 'dispatcher',
  'admin@demo.cl': 'admin',
}

const DEMO_NAMES = {
  'conductor@demo.cl': 'Conductor Demo',
  'despachador@demo.cl': 'Despachador Demo',
  'admin@demo.cl': 'Admin Demo',
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log(`[v0] Demo login request for ${email}`)

    // Only handle demo accounts
    if (!(email in DEMO_CREDENTIALS)) {
      console.log(`[v0] ${email} is not a demo account`)
      return NextResponse.json(
        { error: 'Not a demo account' },
        { status: 400 }
      )
    }

    // Verify credentials
    if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] !== password) {
      console.log(`[v0] Invalid password for ${email}`)
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    console.log(`[v0] Demo credentials valid for ${email}, granting access`)

    // Return success - the demo account is valid
    // The Supabase auth session will be created on the client side
    return NextResponse.json({
      success: true,
      message: 'Demo account authenticated',
      user: {
        email,
        role: DEMO_ROLES[email as keyof typeof DEMO_ROLES],
        full_name: DEMO_NAMES[email as keyof typeof DEMO_NAMES],
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('[v0] Error in demo-login:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
