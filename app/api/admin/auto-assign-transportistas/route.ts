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

    // Only count those assigned to VALID executives
    if (allTransportistas) {
      allTransportistas.forEach((t: any) => {
        if (t.assigned_executive_id && validExecutiveIds.has(t.assigned_executive_id)) {
          const count = executiveLoadMap.get(t.assigned_executive_id) || 0
          executiveLoadMap.set(t.assigned_executive_id, count + 1)
        }
      })
    }

    // Auto-assign each unassigned transportista to executive with lowest load
    const updates: any[] = []
    const updateBatch: any[] = []
    
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
      
      updateBatch.push({
        id: transportista.id,
        assigned_executive_id: selectedExecutive.id
      })
    }

    // Batch update - execute ALL updates together
    if (updateBatch.length > 0) {
      // Use RPC or multiple updates - for now do grouped updates by executive
      const updatesByExecutive = new Map<string, string[]>()
      
      updateBatch.forEach(item => {
        const execId = item.assigned_executive_id
        if (!updatesByExecutive.has(execId)) {
          updatesByExecutive.set(execId, [])
        }
        updatesByExecutive.get(execId)!.push(item.id)
      })

      // Update by executive_id
      for (const [execId, transportistaIds] of updatesByExecutive.entries()) {
        const { error: updateError } = await supabase
          .from('transportistas')
          .update({ assigned_executive_id: execId })
          .in('id', transportistaIds)

        if (updateError) {
          console.error('[v0] Update error for executive', execId, ':', updateError)
          return NextResponse.json(
            { error: `Update failed for executive ${execId}: ${updateError.message}` },
            { status: 500 }
          )
        }
      }
      
      console.log(`[v0] Batch assigned ${updateBatch.length} transportistas`)
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
