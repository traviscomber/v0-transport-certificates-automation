import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    let email = ''

    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      email = body.email
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      email = formData.get('email') as string
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[v0] Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('[v0] Login attempt for:', email)

    // Check if user exists in auth.users
    const authUsersResponse = await fetch(
      `${supabaseUrl}/rest/v1/auth.users?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const authUsers = await authUsersResponse.json()

    if (!authUsers || authUsers.length === 0) {
      console.error('[v0] User not found:', email)
      return NextResponse.json(
        { error: 'Usuario no encontrado. Verifica tu email.' },
        { status: 401 }
      )
    }

    // Get user profile to verify executive assignment
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const profiles = await profileResponse.json()

    if (!profiles || profiles.length === 0) {
      console.error('[v0] Profile not found for:', email)
      return NextResponse.json(
        { error: 'Perfil no encontrado. Contacta a administración.' },
        { status: 401 }
      )
    }

    const profile = profiles[0]

    console.log('[v0] Login successful for:', email, 'Name:', profile.full_name)

    // Create redirect response to dashboard
    const response = NextResponse.redirect(new URL('/dashboard/company', request.url), {
      status: 303, // See Other
    })

    // Set httpOnly cookie with email
    response.cookies.set({
      name: 'user_email',
      value: email.toLowerCase(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Store user info in a regular cookie
    response.cookies.set({
      name: 'user_name',
      value: profile.full_name || email,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Store role in cookie
    response.cookies.set({
      name: 'user_role',
      value: profile.role || 'user',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('[v0] Setting cookies and redirecting to dashboard')
    return response
  } catch (error: any) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
