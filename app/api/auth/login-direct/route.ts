import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    // Call Supabase Auth REST API directly (no SDK)
    console.log('[v0] Attempting login for:', email)
    console.log('[v0] Supabase URL:', supabaseUrl)
    
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
      }),
    })

    const authData = await authResponse.json()

    console.log('[v0] Auth response status:', authResponse.status)
    console.log('[v0] Auth response:', authData)

    if (!authResponse.ok) {
      console.error('[v0] Auth error:', authData)
      return NextResponse.json(
        { error: authData.error_description || authData.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get user profile
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${authData.access_token}`,
        },
      }
    )

    const profiles = await profileResponse.json()
    const profile = profiles[0] || {}

    return NextResponse.json({
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        ...profile,
      },
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      },
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
