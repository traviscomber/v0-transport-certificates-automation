import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user info from cookies (set during login)
    const userEmail = request.cookies.get('user_email')?.value
    const userName = request.cookies.get('user_name')?.value
    const userRole = request.cookies.get('user_role')?.value

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

    const isAdmin = userRole === 'admin'

    console.log('[v0] Dashboard - User:', userEmail, 'Name:', userName, 'Role:', userRole, 'IsAdmin:', isAdmin)

    // Fetch transportistas data
    let transportistasUrl = `${supabaseUrl}/rest/v1/transportistas`
    if (!isAdmin && userName) {
      // Filter by executive name if not admin
      transportistasUrl += `?ejecutiva=eq.${encodeURIComponent(userName)}`
    }

    console.log('[v0] Fetching transportistas from:', transportistasUrl)

    const transportistasResponse = await fetch(transportistasUrl, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    })

    const transportistas = await transportistasResponse.json()
    console.log('[v0] Transportistas count:', Array.isArray(transportistas) ? transportistas.length : 0)

    // Fetch conductores data
    let conductoesUrl = `${supabaseUrl}/rest/v1/conductores`
    if (!isAdmin && userName) {
      // Filter by executive name if not admin
      conductoesUrl += `?ejecutiva=eq.${encodeURIComponent(userName)}`
    }

    console.log('[v0] Fetching conductores from:', conductoesUrl)

    const conductoesResponse = await fetch(conductoesUrl, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    })

    const conductores = await conductoesResponse.json()
    console.log('[v0] Conductores count:', Array.isArray(conductores) ? conductores.length : 0)

    return NextResponse.json({
      user: {
        email: userEmail,
        full_name: userName,
        role: userRole,
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
