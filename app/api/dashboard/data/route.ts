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

    // Fetch subcontratistas data - NO filtering, return all subcontractors
    // Users can filter by ejecutiva name using the UI buttons
    // Add limit=1000 to fetch all records (Supabase default is 1000)
    const subcontratistasUrl = `${supabaseUrl}/rest/v1/subcontratistas?limit=1000`

    console.log('[v0] Fetching subcontratistas from:', subcontratistasUrl)

    const subcontratistasResponse = await fetch(subcontratistasUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    })

    const subcontratistas = await subcontratistasResponse.json()
    console.log('[v0] Subcontratistas count:', Array.isArray(subcontratistas) ? subcontratistas.length : 0)
    
    // Debug: show first subcontratista to check structure
    if (Array.isArray(subcontratistas) && subcontratistas.length > 0) {
      console.log('[v0] First subcontratista sample:', JSON.stringify(subcontratistas[0]).substring(0, 200))
    }
    if (!Array.isArray(subcontratistas)) {
      console.log('[v0] Subcontratistas error response:', JSON.stringify(subcontratistas).substring(0, 300))
    }

    // Fetch conductores data - NO filter, get all drivers
    // They will be linked to subcontractors via rut_proveedor match in the UI
    // Add limit=1000 to fetch all records
    const conductoesUrl = `${supabaseUrl}/rest/v1/conductores?limit=1000`

    console.log('[v0] Fetching conductores from:', conductoesUrl)

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

    // Count drivers per subcontractor (by rut_proveedor match with subcontratista rut)
    const driverCountByRut = new Map<string, number>()
    if (Array.isArray(conductores)) {
      conductores.forEach(conductor => {
        if (conductor.rut_proveedor) {
          const currentCount = driverCountByRut.get(conductor.rut_proveedor) || 0
          driverCountByRut.set(conductor.rut_proveedor, currentCount + 1)
        }
      })
    }

    // Add driver count to each subcontractista
    const subcontratistasWithCounts = Array.isArray(subcontratistas) 
      ? subcontratistas.map(s => ({
          ...s,
          conductores_count: driverCountByRut.get(s.rut) || 0,
        }))
      : []

    return NextResponse.json({
      user: {
        email: userEmail,
        full_name: userName,
        role: userRole,
        isAdmin,
      },
      dashboard: {
        transportistas: subcontratistasWithCounts,
        conductores: Array.isArray(conductores) ? conductores : [],
        stats: {
          totalTransportistas: Array.isArray(subcontratistas) ? subcontratistas.length : 0,
          totalConductores: Array.isArray(conductores) ? conductores.length : 0,
        },
      },
    })
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
