import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// All Labbé executives data
const LABBE_EXECUTIVES = [
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
    full_name: 'Daniela Silva',
    rut: '17768246-2',
    email: 'dsilva@labbe.cl',
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
  {
    full_name: 'Dandús',
    rut: '19999999-9',
    email: 'dandus@labbe.cl',
    cargo: 'Ejecutiva de Cuenta',
  },
]

export async function POST() {
  try {
    const supabase = createAdminClient()

    const results: any[] = []

    for (const exec of LABBE_EXECUTIVES) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('executive_staff')
        .select('id, email')
        .eq('email', exec.email)
        .limit(1)
        .maybeSingle()

      if (existing) {
        results.push({
          email: exec.email,
          status: 'already_exists',
          id: existing.id,
        })
        continue
      }

      // Since transportista_id is required, we need to get a transportista first
      // Get any transportista that can serve as default or create one without an executive first
      const { data: anyTransportista } = await supabase
        .from('transportistas')
        .select('id')
        .limit(1)
        .single()

      if (!anyTransportista) {
        results.push({
          email: exec.email,
          status: 'error',
          message: 'No transportista found to link executive to',
        })
        continue
      }

      // Insert new executive linked to a default transportista
      const { data: newExec, error } = await supabase
        .from('executive_staff')
        .insert({
          full_name: exec.full_name,
          rut: exec.rut,
          email: exec.email,
          cargo: exec.cargo,
          is_active: true,
          transportista_id: anyTransportista.id,
          password_hash: 'hash_placeholder',
        })
        .select('id')
        .single()

      if (error) {
        results.push({
          email: exec.email,
          status: 'error',
          message: error.message,
        })
      } else {
        results.push({
          email: exec.email,
          status: 'created',
          id: newExec?.id,
        })
      }
    }

    // Now run the migration to link executives to their subcontractors
    const migrationResponse = await fetch(
      `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/admin/migrate-executives`,
      { method: 'POST' }
    )

    const migrationData = await migrationResponse.json()

    return NextResponse.json({
      success: true,
      message: 'All executives created and linked',
      executives_created: results,
      migration_result: migrationData,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create executives' },
      { status: 500 }
    )
  }
}
