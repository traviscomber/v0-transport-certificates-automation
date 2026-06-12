import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Auto-assign transportistas using the ORIGINAL CSV data (scripts/subcontratistas.csv)
 * The CSV has the real executive assignments per company (Ejecutiva column).
 * 
 * Mapping: Cecilia (original) -> Javiera Ayala (replacement)
 * 
 * IMPORTANT: This route only assigns transportistas that have NO executive yet
 * (assigned_executive_id IS NULL). It never overwrites manual assignments.
 * 
 * POST /api/admin/auto-assign-transportistas
 * Query param: ?force=true  — to overwrite ALL (admin use only, requires confirmation)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    const supabase = createAdminClient()

    // 1. Read the original CSV file
    const csvPath = join(process.cwd(), 'scripts', 'subcontratistas.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    // Parse CSV (semicolon-separated)
    // Headers: Rut_Proveedor;Proveedor;Representante Legal;Rut R.L.;Ejecutiva;...
    const csvData: { rut: string; ejecutiva: string }[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';')
      if (cols.length >= 5 && cols[0] && cols[4]) {
        csvData.push({
          rut: cols[0].trim(),
          ejecutiva: cols[4].trim(),
        })
      }
    }

    // 2. Build name mapping from CSV ejecutiva names to executive_staff records
    // CSV uses first names only: "Cecilia", "Carolina", "Daniela", "Olga"
    // Cecilia Farias was replaced by Javiera Ayala
    const NAME_MAPPING: Record<string, string> = {
      'Cecilia': 'Javiera',   // Cecilia Farias -> Javiera Ayala (replacement)
      'Carolina': 'Carolina', // Carolina Sepulveda
      'Daniela': 'Daniela',   // Daniela Silva
      'Olga': 'Olga',         // Olga Carrasco
    }

    // 3. Get all active executives from DB
    const { data: executives, error: execError } = await supabase
      .from('executive_staff')
      .select('id, full_name, email')
      .eq('is_active', true)

    if (execError || !executives || executives.length === 0) {
      return NextResponse.json(
        { error: 'No hay ejecutivas activas en la BD' },
        { status: 400 }
      )
    }

    // 4. Build lookup: first name -> executive ID
    const execByFirstName = new Map<string, { id: string; full_name: string }>()
    for (const exec of executives) {
      const firstName = exec.full_name.split(' ')[0]
      execByFirstName.set(firstName, { id: exec.id, full_name: exec.full_name })
    }

    // 5. Get all transportistas from DB
    // If NOT force mode, only fetch transportistas without an assigned executive
    // This protects manual assignments from being overwritten
    let query = supabase
      .from('transportistas')
      .select('id, rut, razon_social, assigned_executive_id')

    if (!force) {
      query = query.is('assigned_executive_id', null)
    }

    const { data: allTransportistas, error: tError } = await query

    if (tError) throw tError

    // Build RUT -> transportista map
    const transportistaByRut = new Map<string, any>()
    allTransportistas?.forEach(t => transportistaByRut.set(t.rut, t))

    // 6. Match CSV ejecutiva to DB executive for each transportista
    const assignments: any[] = []
    const errors: string[] = []
    const updatesByExecutive = new Map<string, string[]>()

    for (const csvRow of csvData) {
      const transportista = transportistaByRut.get(csvRow.rut)
      if (!transportista) {
        errors.push(`RUT ${csvRow.rut} not found in DB`)
        continue
      }

      const mappedName = NAME_MAPPING[csvRow.ejecutiva]
      if (!mappedName) {
        errors.push(`Unknown ejecutiva name: "${csvRow.ejecutiva}" for RUT ${csvRow.rut}`)
        continue
      }

      const executive = execByFirstName.get(mappedName)
      if (!executive) {
        errors.push(`Executive "${mappedName}" (mapped from "${csvRow.ejecutiva}") not found in DB. Available: ${Array.from(execByFirstName.keys()).join(', ')}`)
        continue
      }

      // Group updates by executive ID for batch update
      if (!updatesByExecutive.has(executive.id)) {
        updatesByExecutive.set(executive.id, [])
      }
      updatesByExecutive.get(executive.id)!.push(transportista.id)

      assignments.push({
        rut: csvRow.rut,
        razon_social: transportista.razon_social,
        csv_ejecutiva: csvRow.ejecutiva,
        assigned_to: executive.full_name,
      })
    }

    // 7. Execute batch updates grouped by executive
    for (const [execId, transportistaIds] of updatesByExecutive.entries()) {
      const { error: updateError } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: execId })
        .in('id', transportistaIds)

      if (updateError) {
        return NextResponse.json(
          { error: `Update failed: ${updateError.message}` },
          { status: 500 }
        )
      }
    }

    // 8. Handle transportistas NOT in CSV (new ones added after CSV import)
    const csvRuts = new Set(csvData.map(c => c.rut))
    const notInCsv = allTransportistas?.filter(t => !csvRuts.has(t.rut)) || []
    
    // For new transportistas not in CSV, assign with load balancing
    if (notInCsv.length > 0) {
      // Count current loads after CSV assignments
      const loadCounts = new Map<string, number>()
      executives.forEach(e => loadCounts.set(e.id, 0))
      for (const [execId, ids] of updatesByExecutive.entries()) {
        loadCounts.set(execId, ids.length)
      }

      for (const t of notInCsv) {
        // Find executive with minimum load
        let minExec = executives[0]
        let minLoad = loadCounts.get(minExec.id) || 0
        for (const exec of executives) {
          const load = loadCounts.get(exec.id) || 0
          if (load < minLoad) {
            minExec = exec
            minLoad = load
          }
        }

        const { error: updateError } = await supabase
          .from('transportistas')
          .update({ assigned_executive_id: minExec.id })
          .eq('id', t.id)

        if (!updateError) {
          loadCounts.set(minExec.id, (loadCounts.get(minExec.id) || 0) + 1)
          assignments.push({
            rut: t.rut,
            razon_social: t.razon_social,
            csv_ejecutiva: '(new - not in CSV)',
            assigned_to: minExec.full_name,
          })
        }
      }
    }

    // 9. Build final distribution summary
    const distribution: Record<string, number> = {}
    assignments.forEach(a => {
      distribution[a.assigned_to] = (distribution[a.assigned_to] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      processed: assignments.length,
      csv_rows: csvData.length,
      not_in_csv: notInCsv.length,
      distribution,
      mode: force ? 'FORCE (overwrites all)' : 'SAFE (only unassigned)',
      errors: errors.length > 0 ? errors : undefined,
      message: force
        ? `Asignados ${assignments.length} transportistas (MODO FORZADO - sobreescribio asignaciones manuales)`
        : `Asignados ${assignments.length} transportistas sin ejecutiva asignada (las asignaciones manuales no fueron modificadas)`,
    })
  } catch (error) {
    console.error('[v0] Error in CSV-based auto-assign:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en auto-asignacion' },
      { status: 500 }
    )
  }
}
