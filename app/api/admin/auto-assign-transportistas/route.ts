import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Auto-assign unassigned transportistas to executives with load balancing
 * GET /api/admin/auto-assign-transportistas
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get all active executives
    const { data: executives, error: execError } = await supabase
      .from('executive_staff')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name')

    if (execError || !executives || executives.length === 0) {
      return NextResponse.json(
        { error: 'No hay ejecutivas activas disponibles' },
        { status: 400 }
      )
    }

    // Get unassigned transportistas (NULL or with invalid executive_id)
    const { data: allTransportistas, error: transportistaError } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, assigned_executive_id')
      .order('created_at')

    if (transportistaError) {
      throw transportistaError
    }

    // Filter to only unassigned or with invalid assignment
    const validExecutiveIds = new Set(executives.map(e => e.id))
    const unassigned = allTransportistas?.filter(t => 
      !t.assigned_executive_id || !validExecutiveIds.has(t.assigned_executive_id)
    ) || []

    if (!unassigned || unassigned.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay transportistas sin asignar',
        processed: 0,
      })
    }

    // Count current load for each executive
    const executiveLoadMap = new Map<string, number>()
    executives.forEach(exec => executiveLoadMap.set(exec.id, 0))

    const { data: assigned } = await supabase
      .from('transportistas')
      .select('assigned_executive_id')
      .not('assigned_executive_id', 'is', null)

    if (assigned) {
      assigned.forEach((t: any) => {
        if (t.assigned_executive_id) {
          const count = executiveLoadMap.get(t.assigned_executive_id) || 0
          executiveLoadMap.set(t.assigned_executive_id, count + 1)
        }
      })
    }

    // Auto-assign each unassigned transportista to executive with lowest load
    const updates: any[] = []
    for (const transportista of unassigned) {
      // Find executive with minimum load
      let selectedExecutive = executives[0]
      let minLoad = executiveLoadMap.get(selectedExecutive.id) || 0

      for (const exec of executives) {
        const load = executiveLoadMap.get(exec.id) || 0
        if (load < minLoad) {
          selectedExecutive = exec
          minLoad = load
        }
      }

      // Update load for next iteration
      const newLoad = (executiveLoadMap.get(selectedExecutive.id) || 0) + 1
      executiveLoadMap.set(selectedExecutive.id, newLoad)

      // Record update
      updates.push({
        transportista_id: transportista.id,
        transportista_rut: transportista.rut,
        transportista_name: transportista.razon_social,
        assigned_to: selectedExecutive.full_name,
        assigned_to_id: selectedExecutive.id,
      })

      // Execute update
      const { error: updateError } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: selectedExecutive.id })
        .eq('id', transportista.id)

      if (updateError) {
        console.error(`[v0] Error assigning ${transportista.rut}:`, updateError)
      } else {
        console.log(`[v0] Assigned ${transportista.razon_social} to ${selectedExecutive.full_name}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed: updates.length,
      assignments: updates,
      message: `Auto-asignados ${updates.length} transportistas a ejecutivas`,
    })
  } catch (error) {
    console.error('[v0] Error in auto-assign:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en auto-asignación' },
      { status: 500 }
    )
  }
}
