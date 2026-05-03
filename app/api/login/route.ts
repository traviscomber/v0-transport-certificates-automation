import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[v0] Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('[v0] Login attempt for:', email)

    // Call Supabase Auth REST API directly (no SDK)
    const authResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      }
    )

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      console.error('[v0] Auth error:', authData)
      return NextResponse.json(
        { error: authData.error_description || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get user data from Supabase
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        apikey: supabaseAnonKey,
      },
    })

    const userData = await userResponse.json()

    console.log('[v0] Login successful for:', email)

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      user: userData,
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
      },
      success: true,
    })

    // Set httpOnly cookie with token
    response.cookies.set({
      name: 'supabase_token',
      value: authData.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authData.expires_in,
    })

    // Store user info in a regular cookie for client access
    response.cookies.set({
      name: 'user_email',
      value: userData.email || email.toLowerCase(),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authData.expires_in,
    })

    return response
  } catch (error: any) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
