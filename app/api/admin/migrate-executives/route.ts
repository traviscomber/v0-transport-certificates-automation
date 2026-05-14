import { createAdminClient } from '@/lib/supabase/admin'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mapping de nombres de ejecutivas a emails
const EXECUTIVES_EMAIL_MAP: Record<string, string> = {
  'Olga': 'ocarrasco@labbe.cl',
  'Carolina': 'csepulveda@labbe.cl',
  'Daniela': 'dsilva@labbe.cl',
  'Javiera': 'jayala@labbe.cl',
  'Katherinne': 'kcanales@labbe.cl',
}

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
        // Store by first name and full name
        const firstName = exec.full_name.split(' ')[0]
        executivesByName[firstName.toLowerCase()] = exec.id
        executivesByName[exec.full_name.toLowerCase()] = exec.id
      }
    }

    // 2. Get all transportistas from DB
    const { data: allTransportistas } = await supabase
      .from('transportistas')
      .select('id, rut')

    // Create RUT map for quick lookup
    const rutMap = new Map(
      (allTransportistas || []).map(t => [
        t.rut?.toLowerCase().trim().replace(/\s/g, ''),
        t.id
      ])
    )

    // 3. Create map of subcontractor RUT -> ejecutiva from LABBE_SUBCONTRACTORS
    const rutEjecutivaMap = new Map<string, string>()
    
    for (const sub of LABBE_SUBCONTRACTORS) {
      if (sub.rut && sub.ejecutiva) {
        const normalizedRut = sub.rut.toLowerCase().trim().replace(/\s/g, '')
        rutEjecutivaMap.set(normalizedRut, sub.ejecutiva)
      }
    }

    // 4. Update transportistas with assigned_executive_id
    let updatedCount = 0
    const updateResults: any[] = []
    const notFoundResults: any[] = []

    for (const [rutNorm, ejecutivaNombre] of rutEjecutivaMap.entries()) {
      const transportistaId = rutMap.get(rutNorm)
      if (!transportistaId) {
        notFoundResults.push({
          rut: rutNorm,
          ejecutiva: ejecutivaNombre,
          reason: 'Transportista not found in DB',
        })
        continue
      }

      // Get executive ID by name
      const executiveId = executivesByName[ejecutivaNombre.toLowerCase()]
      if (!executiveId) {
        notFoundResults.push({
          rut: rutNorm,
          ejecutiva: ejecutivaNombre,
          reason: 'Executive not found',
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
            rut: rutNorm,
            transportista_id: transportistaId,
            ejecutiva: ejecutivaNombre,
            assigned_executive_id: executiveId,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Executive assignment migration completed',
      executives_found: Object.keys(executivesByName).length,
      subcontractors_total: LABBE_SUBCONTRACTORS.length,
      subcontractors_with_ejecutiva: rutEjecutivaMap.size,
      transportistas_in_db: allTransportistas?.length || 0,
      transportistas_updated: updatedCount,
      transportistas_not_found: notFoundResults.length,
      success_rate: `${Math.round((updatedCount / (rutEjecutivaMap.size || 1)) * 100)}%`,
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
