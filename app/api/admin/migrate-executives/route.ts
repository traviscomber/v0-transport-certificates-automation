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

    // 1. Get all executives - fetch once instead of one by one
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

    console.log('[v0] Found executives:', executiveIds)

    // 2. Get all transportistas with RUT for matching
    const { data: allTransportistas } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social')

    console.log('[v0] Total transportistas in DB:', allTransportistas?.length)
    console.log('[v0] Sample transportistas from DB:')
    allTransportistas?.slice(0, 5).forEach(t => {
      console.log('[v0]   ID:', t.id, 'RUT:', t.rut, 'Name:', t.razon_social)
    })
    console.log('[v0] Sample subcontractors from data:')
    LABBE_SUBCONTRACTORS.slice(0, 5).forEach(s => {
      console.log('[v0]   RUT:', s.rut, 'Nombre:', s.nombre, 'Ejecutiva:', s.ejecutiva)
    })

    // Create RUT map for quick lookup
    const rutMap = new Map(
      (allTransportistas || []).map(t => [
        t.rut?.toLowerCase().trim().replace(/\s/g, ''),
        { id: t.id, razon_social: t.razon_social }
      ])
    )

    console.log('[v0] RUT map size:', rutMap.size)

    // 3. Update transportistas with assigned_executive_id based on ejecutiva field
    let updatedCount = 0
    const updateResults: any[] = []
    const notFoundResults: any[] = []

    for (const subcontractor of LABBE_SUBCONTRACTORS) {
      if (!subcontractor.ejecutiva || !subcontractor.rut) continue

      const executiveId = executiveIds[subcontractor.ejecutiva]
      if (!executiveId) continue

      // Find transportista by RUT - normalize both
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

      // Update the transportista
      const { error } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: executiveId })
        .eq('id', transportistaInfo.id)

      if (!error) {
        updatedCount++
        if (updateResults.length < 10) {
          updateResults.push({
            transportista_id: transportistaInfo.id,
            razon_social: transportistaInfo.razon_social,
            rut: subcontractor.rut,
            ejecutiva: subcontractor.ejecutiva,
            executive_id: executiveId,
          })
        }
      }
    }

    console.log('[v0] Migration complete - updated:', updatedCount, 'not found:', notFoundResults.length)

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      executives_found: Object.entries(executiveIds).length,
      executives_map: executiveIds,
      subcontractistas_total: LABBE_SUBCONTRACTORS.length,
      subcontractistas_updated: updatedCount,
      subcontractistas_not_found: notFoundResults.length,
      sample_updates: updateResults,
      sample_not_found: notFoundResults.slice(0, 5),
    })
  } catch (error: any) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'Migration failed', stack: error.stack },
      { status: 500 }
    )
  }
}
