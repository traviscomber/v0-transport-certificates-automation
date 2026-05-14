import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'

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

    // 1. Get all executives and create email->id map
    const { data: allExecutives } = await supabase
      .from('executive_staff')
      .select('id, email')

    const executiveIds: Record<string, string> = {}
    
    for (const [name, email] of Object.entries(EXECUTIVES_EMAIL_MAP)) {
      const exec = allExecutives?.find(e => e.email?.toLowerCase() === email.toLowerCase())
      if (exec) {
        executiveIds[name] = exec.id
      }
    }

    // 2. Get all transportistas in DB to create RUT map
    const { data: allTransportistasDB } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social')

    // Create RUT map for quick lookup
    const rutMap = new Map(
      (allTransportistasDB || []).map(t => [
        t.rut?.toLowerCase().trim().replace(/\s/g, ''),
        { id: t.id, razon_social: t.razon_social }
      ])
    )

    // 3. Iterate through LABBE_SUBCONTRACTORS and link with executives
    let updatedCount = 0
    const updateResults: any[] = []
    const notFoundResults: any[] = []

    for (const subcontractor of LABBE_SUBCONTRACTORS) {
      if (!subcontractor.ejecutiva || !subcontractor.rut) continue

      const executiveId = executiveIds[subcontractor.ejecutiva]
      if (!executiveId) continue

      // Normalize RUT for consistency
      const normalizedRut = subcontractor.rut.toLowerCase().trim().replace(/\s/g, '')
      const transportistaInfo = rutMap.get(normalizedRut)

      if (!transportistaInfo) {
        notFoundResults.push({
          rut: subcontractor.rut,
          nombre: subcontractor.nombre,
          ejecutiva: subcontractor.ejecutiva,
        })
        continue
      }

      // Update the transportista with assigned_executive_id
      const { error } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: executiveId })
        .eq('id', transportistaInfo.id)

      if (!error) {
        updatedCount++
        if (updateResults.length < 20) {
          updateResults.push({
            transportista_id: transportistaInfo.id,
            rut: subcontractor.rut,
            nombre: subcontractor.nombre,
            razon_social: transportistaInfo.razon_social,
            ejecutiva: subcontractor.ejecutiva,
            assigned_executive_id: executiveId,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Executive assignment migration completed',
      executives_created: Object.entries(executiveIds).length,
      executives_map: executiveIds,
      subcontractors_in_file: LABBE_SUBCONTRACTORS.length,
      transportistas_in_db: allTransportistasDB?.length || 0,
      transportistas_updated: updatedCount,
      transportistas_not_found: notFoundResults.length,
      success_rate: `${Math.round((updatedCount / LABBE_SUBCONTRACTORS.length) * 100)}%`,
      sample_linked: updateResults.slice(0, 10),
      sample_not_found: notFoundResults.slice(0, 5),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
