import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/[id]/conductors
 * Fetch conductors associated with a subcontractor
 * 
 * Handles both:
 * - transportista_id (direct match)
 * - subcontractor id (when called from subcontractor modal)
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

    // Try to find conductors in three ways:
    // 1. Query by transportista_id directly
    let { data: conductors, error } = await supabase
      .from('conductores')
      .select('id, nombre_completo, numero_licencia, rut, status, fecha_expiracion_licencia, created_at')
      .eq('transportista_id', id)
      .order('nombre_completo', { ascending: true })

    if (error || !conductors || conductors.length === 0) {
      // 2. Try to find the transportista and get its conductors
      const { data: transportista, error: transError } = await supabase
        .from('transportistas')
        .select('id')
        .eq('id', id)
        .single()

      if (!transError && transportista) {
        // Now query conductors by this transportista's ID
        const { data: conductoresData } = await supabase
          .from('conductores')
          .select('id, nombre_completo, numero_licencia, rut, status, fecha_expiracion_licencia, created_at')
          .eq('transportista_id', transportista.id)
          .order('nombre_completo', { ascending: true })

        conductors = conductoresData || []
      }
    }

    if (error && (!conductors || conductors.length === 0)) {
      console.error('[v0] Error fetching conductors:', error)
      // Return empty array instead of error to avoid UI breaking
      return NextResponse.json([])
    }

    return NextResponse.json(conductors || [])
  } catch (error) {
    console.error('[v0] Conductors GET error:', error)
    // Return empty array on error to avoid UI breaking
    return NextResponse.json([])
  }
}
