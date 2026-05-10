import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/[id]/conductors
 * Fetch conductors associated with a subcontractor
 * 
 * Conductors are linked to subcontractors via:
 * - rut_proveedor field in conductores table = rut field in transportistas table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: 'Subcontractor ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, fetch the subcontractor to get its RUT
    const { data: subcontractor, error: subError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('id', id)
      .single()

    if (subError || !subcontractor) {
      console.error('[v0] Error fetching subcontractor:', subError)
      // Return empty array instead of error to avoid UI breaking
      return NextResponse.json([])
    }

    console.log('[v0] Fetching conductors for subcontractor RUT:', subcontractor.rut)

    // Now query conductors by rut_proveedor matching the subcontractor's RUT
    const { data: conductors, error: conductorsError } = await supabase
      .from('conductores')
      .select('id, nombre_completo, numero_licencia, rut, status, fecha_expiracion_licencia, created_at, rut_proveedor')
      .eq('rut_proveedor', subcontractor.rut)
      .order('nombre_completo', { ascending: true })

    if (conductorsError) {
      console.error('[v0] Error fetching conductors:', conductorsError)
      // Return empty array on error to avoid UI breaking
      return NextResponse.json([])
    }

    console.log('[v0] Found conductors:', conductors?.length || 0)
    return NextResponse.json(conductors || [])
  } catch (error) {
    console.error('[v0] Conductors GET error:', error)
    // Return empty array on error to avoid UI breaking
    return NextResponse.json([])
  }
}
