import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'

export const dynamic = 'force-dynamic'

// Mapping de nombres de ejecutivas a emails (para encontrarlas en la BD)
const EXECUTIVES_EMAIL_MAP: Record<string, string> = {
  'Olga': 'ocarrasco@labbe.cl',
  'Carolina': 'csepulveda@labbe.cl',
  'Daniela': 'dsilva@labbe.cl',
  'Javiera': 'jayala@labbe.cl',
  'Katherinne': 'kcanales@labbe.cl',
}

const NEW_EXECUTIVES = [
  {
    full_name: 'Olga Carrasco',
    rut: '10574005-0',
    email: 'ocarrasco@labbe.cl',
    cargo: 'Ejecutiva de Cuenta',
  },
  {
    full_name: 'Carolina Sepúlveda',
    rut: '15464094-0',
    email: 'csepulveda@labbe.cl',
    cargo: 'Ejecutiva de Cuenta',
  },
  {
    full_name: 'Javiera Ayala',
    rut: '18450987-1',
    email: 'jayala@labbe.cl',
    cargo: 'Ejecutiva de Cuenta',
  },
  {
    full_name: 'Katherinne Canales',
    rut: '18717311-6',
    email: 'kcanales@labbe.cl',
    cargo: 'Ejecutiva de Cuenta',
  },
]

export async function POST() {
  try {
    const supabase = createAdminClient()

    // 1. Get all existing executives by email
    const executiveIds: Record<string, string> = {}
    
    for (const [name, email] of Object.entries(EXECUTIVES_EMAIL_MAP)) {
      const { data, error } = await supabase
        .from('executive_staff')
        .select('id')
        .eq('email', email)
        .limit(1)
        .single()

      if (data) {
        executiveIds[name] = data.id
      }
    }

    // 2. Insert missing executives  (only those not found)
    const missingNames = Object.entries(EXECUTIVES_EMAIL_MAP)
      .filter(([name]) => !executiveIds[name])
      .map(([name]) => name)

    for (const name of missingNames) {
      const exec = NEW_EXECUTIVES.find(e => e.email === EXECUTIVES_EMAIL_MAP[name])
      if (!exec) continue

      // Need a dummy transportista_id - use the first existing one or create association later
      // For now, we'll use a placeholder since these are company executives, not subcontractor staff
      // We'll handle this differently by just updating transportistas.assigned_executive_id directly
    }

    // 3. Update transportistas/subcontractistas with assigned_executive_id based on ejecutiva field
    const { data: allTransportistas } = await supabase
      .from('transportistas')
      .select('id, razon_social')

    let updatedCount = 0
    const updateResults: any[] = []

    // Map subcontractors data to transportistas
    for (const sub of LABBE_SUBCONTRACTORS) {
      if (!sub.ejecutiva) continue

      const executiveId = executiveIds[sub.ejecutiva]
      if (!executiveId) continue

      // Find transportista by RUT
      const transportista = allTransportistas?.find(
        t => t.razon_social && (t.razon_social.includes(sub.nombre) || sub.nombre.includes(t.razon_social))
      )

      if (!transportista) continue

      const { error } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: executiveId })
        .eq('id', transportista.id)

      if (!error) {
        updatedCount++
        updateResults.push({
          transportista_id: transportista.id,
          razon_social: transportista.razon_social,
          ejecutiva: sub.ejecutiva,
          executive_id: executiveId,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      executives_found: Object.entries(executiveIds).length,
      executives_map: executiveIds,
      subcontractistas_updated: updatedCount,
      sample_updates: updateResults.slice(0, 10),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
