import { createAdminClient } from '@/lib/supabase/admin'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // 1. Get all executives and create name->id map
    const { data: allExecutives } = await supabase
      .from('executive_staff')
      .select('id, full_name')

    const executivesByName: Record<string, string> = {}
    
    for (const exec of allExecutives || []) {
      if (exec.full_name) {
        const firstName = exec.full_name.split(' ')[0]
        executivesByName[firstName.toLowerCase()] = exec.id
        executivesByName[exec.full_name.toLowerCase()] = exec.id
      }
    }

    // 2. Create map of RUT -> ejecutiva from LABBE_SUBCONTRACTORS
    const rutEjecutivaMap = new Map<string, string>()
    
    for (const sub of LABBE_SUBCONTRACTORS) {
      if (sub.rut && sub.ejecutiva) {
        const normalizedRut = sub.rut.toLowerCase().trim().replace(/[^\w\d\-k]/g, '')
        rutEjecutivaMap.set(normalizedRut, sub.ejecutiva)
      }
    }

    // 3. Get all conductores with rut_proveedor and transportista_id from DB
    const { data: allConductores } = await supabase
      .from('conductores')
      .select('id, rut_proveedor, transportista_id')

    // Create map of transportista_id -> rut_proveedor from conductores
    const transportistaRutMap = new Map<string, string>()
    
    for (const conductor of allConductores || []) {
      if (conductor.transportista_id && conductor.rut_proveedor) {
        transportistaRutMap.set(
          conductor.transportista_id,
          conductor.rut_proveedor.toLowerCase().trim().replace(/[^\w\d\-k]/g, '')
        )
      }
    }

    // 4. Update transportistas with assigned_executive_id
    let updatedCount = 0
    const updateResults: any[] = []
    const notFoundResults: any[] = []

    for (const [transportistaId, rutProveedor] of transportistaRutMap.entries()) {
      const ejecutivaNombre = rutEjecutivaMap.get(rutProveedor)
      
      if (!ejecutivaNombre) {
        notFoundResults.push({
          transportista_id: transportistaId,
          rut_proveedor: rutProveedor,
          reason: 'No ejecutiva found in subcontractors data',
        })
        continue
      }

      // Get executive ID by name
      const executiveId = executivesByName[ejecutivaNombre.toLowerCase()]
      if (!executiveId) {
        notFoundResults.push({
          transportista_id: transportistaId,
          rut_proveedor: rutProveedor,
          ejecutiva: ejecutivaNombre,
          reason: 'Executive name not found',
        })
        continue
      }

      // Update the transportista with assigned_executive_id
      const { error } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: executiveId })
        .eq('id', transportistaId)

      if (!error) {
        updatedCount++
        if (updateResults.length < 20) {
          updateResults.push({
            transportista_id: transportistaId,
            rut_proveedor: rutProveedor,
            ejecutiva: ejecutivaNombre,
            assigned_executive_id: executiveId,
          })
        }
      } else {
        notFoundResults.push({
          transportista_id: transportistaId,
          rut_proveedor: rutProveedor,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Executive assignment migration completed via conductores',
      executives_found: Object.keys(executivesByName).length,
      conductores_total: allConductores?.length || 0,
      conductores_with_transportista_id: transportistaRutMap.size,
      subcontractors_with_ejecutiva: rutEjecutivaMap.size,
      transportistas_updated: updatedCount,
      transportistas_not_found: notFoundResults.length,
      success_rate: `${Math.round((updatedCount / (transportistaRutMap.size || 1)) * 100)}%`,
      sample_linked: updateResults,
      sample_not_found: notFoundResults.slice(0, 10),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
