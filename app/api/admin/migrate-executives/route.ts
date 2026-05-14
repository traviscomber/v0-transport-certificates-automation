import { createAdminClient } from '@/lib/supabase/admin'
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

    // 1. Get all executives and create email->id and name->id maps
    const { data: allExecutives } = await supabase
      .from('executive_staff')
      .select('id, email, full_name')

    const executivesByEmail: Record<string, string> = {}
    const executivesByName: Record<string, string> = {}
    
    for (const exec of allExecutives || []) {
      if (exec.email) {
        executivesByEmail[exec.email.toLowerCase()] = exec.id
      }
      if (exec.full_name) {
        executivesByName[exec.full_name.toLowerCase()] = exec.id
      }
    }

    // 2. Get all transportistas with ejecutiva_nombre
    const { data: allTransportistas } = await supabase
      .from('transportistas')
      .select('*')

    // 3. Update transportistas with assigned_executive_id based on ejecutiva_nombre
    let updatedCount = 0
    const updateResults: any[] = []
    const notFoundResults: any[] = []

    for (const transportista of allTransportistas || []) {
      if (!transportista.ejecutiva_nombre) {
        notFoundResults.push({
          rut: transportista.rut,
          razon_social: transportista.razon_social,
          reason: 'No ejecutiva_nombre',
        })
        continue
      }

      // Try to find executive by name first, then by email if mapped
      let executiveId = executivesByName[transportista.ejecutiva_nombre.toLowerCase()]
      
      if (!executiveId) {
        // Try to find by email mapping
        const email = EXECUTIVES_EMAIL_MAP[transportista.ejecutiva_nombre]
        if (email) {
          executiveId = executivesByEmail[email.toLowerCase()]
        }
      }

      if (!executiveId) {
        notFoundResults.push({
          rut: transportista.rut,
          razon_social: transportista.razon_social,
          ejecutiva_nombre: transportista.ejecutiva_nombre,
          reason: 'Executive not found',
        })
        continue
      }

      // Update the transportista with assigned_executive_id
      const { error } = await supabase
        .from('transportistas')
        .update({ assigned_executive_id: executiveId })
        .eq('id', transportista.id)

      if (!error) {
        updatedCount++
        if (updateResults.length < 20) {
          updateResults.push({
            transportista_id: transportista.id,
            rut: transportista.rut,
            razon_social: transportista.razon_social,
            ejecutiva_nombre: transportista.ejecutiva_nombre,
            assigned_executive_id: executiveId,
          })
        }
      } else {
        notFoundResults.push({
          rut: transportista.rut,
          razon_social: transportista.razon_social,
          ejecutiva_nombre: transportista.ejecutiva_nombre,
          reason: `Update error: ${error.message}`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Executive assignment migration completed',
      executives_found: Object.keys(executivesByName).length,
      executives_map: executivesByName,
      transportistas_total: allTransportistas?.length || 0,
      transportistas_updated: updatedCount,
      transportistas_not_found: notFoundResults.length,
      success_rate: `${Math.round((updatedCount / (allTransportistas?.length || 1)) * 100)}%`,
      sample_linked: updateResults.slice(0, 10),
      sample_not_found: notFoundResults.slice(0, 5),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Migration failed', stack: error.stack },
      { status: 500 }
    )
  }
}
