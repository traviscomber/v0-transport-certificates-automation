import { NextRequest, NextResponse } from 'next/server'

function maskEmail(email?: string | null) {
  if (!email) return 'unknown'
  const [local, domain] = email.split('@')
  if (!domain) return 'unknown'
  return `${local.slice(0, 2)}***@${domain}`
}

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

    console.log('[v0] Login attempt for:', maskEmail(email))

    // Try to get user from profiles table first (admins, executives)
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
    let user: any = null
    let role = 'user'
    let fullName = ''
    let organizationId = ''

    if (profiles && profiles.length > 0) {
      // Found in profiles table (admin, executive, etc)
      user = profiles[0]
      fullName = user.full_name
      role = user.role || 'admin'
      organizationId = user.organization_id

      console.log('[v0] Found in profiles table:', { email: maskEmail(email), role, fullName })
    } else {
      // Not in profiles, try executive_staff table (ejecutivas)
      console.log('[v0] Not in profiles, checking executive_staff table...')
      
      const executiveResponse = await fetch(
        `${supabaseUrl}/rest/v1/executive_staff?email=eq.${encodeURIComponent(email)}&is_active=eq.true`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )

      const executives = await executiveResponse.json()

      if (executives && executives.length > 0) {
        // Found in executive_staff table
        const executive = executives[0]
        user = executive
        fullName = executive.full_name
        role = 'ejecutiva'
        organizationId = executive.transportista_id

        console.log('[v0] Found in executive_staff table (ejecutiva):', { email: maskEmail(email), fullName, organizationId })
      }
    }

    if (!user) {
      // Not in profiles, try conductores table (drivers)
      console.log('[v0] Not in profiles, checking conductores table...')
      
      const conductoresResponse = await fetch(
        `${supabaseUrl}/rest/v1/conductores?email=eq.${encodeURIComponent(email)}&select=*`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )

      const conductores = await conductoresResponse.json()

      if (conductores && conductores.length > 0) {
        // Found in conductores table (driver)
        const conductor = conductores[0]
        user = conductor
        fullName = `${conductor.nombres} ${conductor.apellido_paterno} ${conductor.apellido_materno || ''}`.trim()
        role = 'driver'
        organizationId = conductor.transportista_id

        console.log('[v0] Found in conductores table (driver):', { email: maskEmail(email), fullName, organizationId })
      }
    }

    if (!user) {
      console.error('[v0] User not found in profiles or conductores:', email)
      return NextResponse.json(
        { error: 'Usuario no encontrado. Verifica tu email.' },
        { status: 401 }
      )
    }

    // If organization_id is still missing, query it from conductores or transportistas table
    if (!organizationId) {
      console.log('[v0] organization_id not found, querying from database...')
      
      // Get the first conductor for this company to find their transportista_id
      const conductoresResponse = await fetch(
        `${supabaseUrl}/rest/v1/conductores?select=transportista_id&limit=1`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )

      const conductores = await conductoresResponse.json()
      
      if (conductores && conductores.length > 0) {
        organizationId = conductores[0].transportista_id
        console.log('[v0] Found organizationId from conductor:', organizationId)
      } else {
        // Fallback: use first transportista
        const transportistasResponse = await fetch(
          `${supabaseUrl}/rest/v1/transportistas?select=id&limit=1`,
          {
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        )
        const transportistas = await transportistasResponse.json()
        if (transportistas && transportistas.length > 0) {
          organizationId = transportistas[0].id
          console.log('[v0] Found organizationId from transportista:', organizationId)
        }
      }
    }

    console.log('[v0] Login successful for:', maskEmail(email), 'Role:', role, 'Org:', organizationId)

    // Return success JSON response
    const response = NextResponse.json({
      success: true,
      user: {
        email: email.toLowerCase(),
        full_name: fullName,
        role: role,
        organization_id: organizationId,
      },
    })

    // Set cookies with permissive settings to ensure they stick
    response.cookies.set({
      name: 'user_email',
      value: email.toLowerCase(),
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set({
      name: 'user_name',
      value: fullName || email,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set({
      name: 'user_role',
      value: role,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set({
      name: 'user_organization_id',
      value: organizationId || '',
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    console.log('[v0] Cookies set with path=/, user org:', organizationId, 'role:', role)
    return response
  } catch (error: any) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
