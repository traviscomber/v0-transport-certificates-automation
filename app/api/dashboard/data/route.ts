import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user email from cookies (set during login)
    const userEmail = request.cookies.get('user_email')?.value

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Fetch user profile to get their name and role
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${userEmail}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const profiles = await profileResponse.json()
    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    const profile = profiles[0]
    const isAdmin = profile.role === 'admin'
    const executiveName = profile.full_name

    console.log('[v0] Dashboard - User:', userEmail, 'Role:', profile.role, 'Executive:', executiveName)

    // Fetch transportistas data
    let transportistasUrl = `${supabaseUrl}/rest/v1/transportistas`
    if (!isAdmin) {
      // Filter by executive if not admin
      transportistasUrl += `?ejecutiva=eq.${encodeURIComponent(executiveName)}`
    }

    const transportistasResponse = await fetch(transportistasUrl, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    })

    const transportistas = await transportistasResponse.json()

    // Fetch conductores data
    let conductoesUrl = `${supabaseUrl}/rest/v1/conductores`
    if (!isAdmin) {
      // Filter by executive if not admin
      conductoesUrl += `?ejecutiva=eq.${encodeURIComponent(executiveName)}`
    }

    const conductoesResponse = await fetch(conductoesUrl, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    })

    const conductores = await conductoesResponse.json()

    return NextResponse.json({
      user: {
        email: userEmail,
        full_name: executiveName,
        role: profile.role,
        isAdmin,
      },
      dashboard: {
        transportistas: Array.isArray(transportistas) ? transportistas : [],
        conductores: Array.isArray(conductores) ? conductores : [],
        stats: {
          totalTransportistas: Array.isArray(transportistas) ? transportistas.length : 0,
          totalConductores: Array.isArray(conductores) ? conductores.length : 0,
        },
      },
    })
  } catch (error: any) {
    console.error('[v0] Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Error al cargar datos del dashboard' },
      { status: 500 }
    )
  }
}
