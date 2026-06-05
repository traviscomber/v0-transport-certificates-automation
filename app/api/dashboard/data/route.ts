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

    // Fetch transportistas with contact data from subcontratistas via JOIN
    // Using PostgreSQL WITH clause to join the tables on RUT
    const transportistasUrl = `${supabaseUrl}/rest/v1/rpc/get_transportistas_with_contact`

    // First try the RPC function, if it doesn't exist, fall back to fetching separately
    let transportistas: any[] = []
    
    try {
      const rpcResponse = await fetch(transportistasUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      })

      if (rpcResponse.ok) {
        transportistas = await rpcResponse.json()
      } else {
        throw new Error('RPC not available, using fallback')
      }
    } catch (rpcError) {
      // Fallback: fetch both tables separately and merge
      
      const transportistasUrl2 = `${supabaseUrl}/rest/v1/transportistas?limit=1000`
      const subcontratistasUrl = `${supabaseUrl}/rest/v1/subcontratistas?limit=1000`

      const [transportistasResp, subcontratistasResp] = await Promise.all([
        fetch(transportistasUrl2, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
          },
        }),
        fetch(subcontratistasUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
          },
        })
      ])

      const transportistasData = await transportistasResp.json()
      const subcontratistasData = await subcontratistasResp.json()

      // Create a map of subcontratistas by RUT for quick lookup
      const subMap = new Map()
      if (Array.isArray(subcontratistasData)) {
        subcontratistasData.forEach((sub: any) => {
          subMap.set(sub.rut, sub)
        })
      }

      // Merge data: use transportistas as base, enhance with contact info from subcontratistas
      transportistas = Array.isArray(transportistasData) 
        ? transportistasData.map((t: any) => {
            const sub = subMap.get(t.rut)
            return {
              ...t,
              // Use subcontratistas contact info if available (estos tienen los datos que actualizamos)
              email: sub?.email || t.email || '',
              telefono: sub?.telefono || t.telefono || '',
              correo: sub?.email || t.correo || '',
              ejecutivo_nombre: t.ejecutivo_nombre || sub?.ejecutiva || 'Sin asignar',
              direccion: sub?.direccion || t.direccion || '',
              // Keep transportistas comune (no overwrite with subcontratistas if null)
              comuna: t.comuna || sub?.comuna || '',
            }
          })
        : []
    }

    // Fetch executives to resolve assigned_executive_id -> name
    const executivesUrl = `${supabaseUrl}/rest/v1/executive_staff?select=id,full_name&is_active=eq.true`
    // Fetch conductores data - NO filter, get all drivers
    const conductoesUrl = `${supabaseUrl}/rest/v1/conductores?limit=1000`

    const [executivesResponse, conductoesResponse] = await Promise.all([
      fetch(executivesUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      }),
      fetch(conductoesUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact',
        },
      }),
    ])

    const executivesData = await executivesResponse.json()
    const conductores = await conductoesResponse.json()

    // Build executive ID -> name map
    const execMap = new Map<string, string>()
    if (Array.isArray(executivesData)) {
      executivesData.forEach((e: any) => execMap.set(e.id, e.full_name))
    }

    // Resolve assigned_executive_id to real name on each transportista
    if (Array.isArray(transportistas)) {
      transportistas = transportistas.map((t: any) => {
        if (t.assigned_executive_id && execMap.has(t.assigned_executive_id)) {
          return { ...t, ejecutivo_nombre: execMap.get(t.assigned_executive_id) }
        }
        return t
      })
    }

    // Create a map of subcontratistas by RUT to get ejecutivo info
    const subMap = new Map()
    if (Array.isArray(transportistas)) {
      transportistas.forEach((sub: any) => {
        subMap.set(sub.rut, sub)
      })
    }

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

    // Enrich conductores with ejecutivo information from their associated subcontractor
    const conductoesEnriquecidos = Array.isArray(conductores)
      ? conductores.map((conductor: any) => {
          const subcontractor = subMap.get(conductor.rut_proveedor)
          
          // Build full name from available fields
          let fullName = conductor.nombre || ''
          if (!fullName) {
            // If no 'nombre' field, try to build from apellido_paterno and nombres
            const nombres = conductor.nombres || conductor.nombre_conductor || ''
            const apellidoPaterno = conductor.apellido_paterno || ''
            const apellidoMaterno = conductor.apellido_materno || ''
            fullName = [apellidoPaterno, apellidoMaterno, nombres]
              .filter(Boolean)
              .join(' ')
              .trim() || `Conductor ${conductor.rut || 'N/A'}`
          }
          
          return {
            ...conductor,
            conductor_id: conductor.id,  // Ensure UUID is available as conductor_id for documents page
            nombre: fullName,
            ejecutivo_nombre: subcontractor?.ejecutivo_nombre || subcontractor?.ejecutiva || 'Sin asignar',
            nombre_subcontratista: subcontractor?.razon_social || subcontractor?.nombre_fantasia || conductor.rut_proveedor || 'N/A',
          }
        })
      : []

    const response_obj = NextResponse.json({
      user: {
        email: userEmail,
        full_name: userName,
        role: userRole,
        isAdmin,
      },
      dashboard: {
        transportistas: transportistasWithCounts,
        conductores: conductoesEnriquecidos,
        stats: {
          totalTransportistas: Array.isArray(transportistas) ? transportistas.length : 0,
          totalConductores: Array.isArray(conductoesEnriquecidos) ? conductoesEnriquecidos.length : 0,
        },
      },
    })

    // Add cache-busting headers
    response_obj.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response_obj.headers.set('Pragma', 'no-cache')
    response_obj.headers.set('Expires', '0')
    return response_obj
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al cargar datos del dashboard', details: error?.message },
      { status: 500 }
    )
  }
}
