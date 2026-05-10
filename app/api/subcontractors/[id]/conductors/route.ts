import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/[id]/conductors
 * Fetch conductors associated with a subcontractor
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

    // Query conductors table for drivers associated with this subcontractor
    const { data: conductors, error } = await supabase
      .from('conductores')
      .select('id, nombre_completo, numero_licencia, rut, status, fecha_expiracion_licencia, created_at')
      .eq('transportista_id', id)
      .order('nombre_completo', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching conductors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conductors' },
        { status: 500 }
      )
    }

    return NextResponse.json(conductors || [])
  } catch (error) {
    console.error('[v0] Conductors GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
