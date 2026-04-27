import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Fetch transportistas (subcontratistas) data - NO filtering, return all subcontractors
    // Users can filter by ejecutiva name using the UI buttons
    // Add limit=1000 to fetch all records (Supabase default is 1000)
    const transportistasUrl = `${supabaseUrl}/rest/v1/subcontratistas?limit=1000`

    console.log('[v0] Fetching subcontratistas from:', transportistasUrl)

    const transportistasResponse = await fetch(transportistasUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    })

    const transportistas = await transportistasResponse.json()
    console.log('[v0] Transportistas count:', Array.isArray(transportistas) ? transportistas.length : 0)

    // Fetch conductores data - NO filter, get all drivers
    // They will be linked to subcontractors via rut_proveedor match in the UI
    // Add limit=1000 to fetch all records
    const conductoesUrl = `${supabaseUrl}/rest/v1/conductores?limit=1000`

    const conductoesResponse = await fetch(conductoesUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    })

    const conductores = await conductoesResponse.json()
    console.log('[v0] Conductores count:', Array.isArray(conductores) ? conductores.length : 0)

    // Count drivers per transportista (by rut_proveedor match with transportista rut)
    const driverCountByRut = new Map<string, number>()
    if (Array.isArray(conductores)) {
      conductores.forEach((conductor) => {
        if (conductor.rut_proveedor) {
          const currentCount = driverCountByRut.get(conductor.rut_proveedor) || 0
          driverCountByRut.set(conductor.rut_proveedor, currentCount + 1)
        }
      })
    }

    // Add driver count to each transportista
    const transportistasWithCounts = Array.isArray(transportistas) 
      ? transportistas.map((s) => ({
          ...s,
          conductores_count: driverCountByRut.get(s.rut) || 0,
        }))
      : []

    console.log('[v0] Dashboard stats - Transportistas:', Array.isArray(transportistasWithCounts) ? transportistasWithCounts.length : 0, ', Conductores:', Array.isArray(conductores) ? conductores.length : 0)

    const response_obj = NextResponse.json({
      user: {
        email: userEmail,
        full_name: userName,
        role: userRole,
        isAdmin,
      },
      dashboard: {
        transportistas: transportistasWithCounts,
        conductores: Array.isArray(conductores) ? conductores : [],
        stats: {
          totalTransportistas: Array.isArray(transportistas) ? transportistas.length : 0,
          totalConductores: Array.isArray(conductores) ? conductores.length : 0,
        },
      },
    })

    // Add cache-busting headers
    response_obj.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response_obj.headers.set('Pragma', 'no-cache')
    response_obj.headers.set('Expires', '0')
    return response_obj
  } catch (error: any) {
    console.error('[v0] Dashboard data error:', error)
    console.error('[v0] Error message:', error?.message)
    console.error('[v0] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Error al cargar datos del dashboard', details: error?.message },
      { status: 500 }
    )
  }
}
