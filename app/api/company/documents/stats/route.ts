export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

type TransportistaCertificationFlags = {
  ariztia: boolean | null
  lts: boolean | null
  rendic: boolean | null
  interpolar: boolean | null
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const countByStatus = async (table: string, statusColumn: string, status: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('is_current', true)
        .eq(statusColumn, status)

      if (error) throw error
      return count || 0
    }

    const countCurrent = async (table: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('is_current', true)

      if (error) throw error
      return count || 0
    }

    const [
      conductorTotal,
      conductorApproved,
      conductorRejected,
      conductorPending,
      subcontractorTotal,
      subcontractorApproved,
      subcontractorRejected,
      subcontractorPending,
      transportistasResult,
    ] = await Promise.all([
      countCurrent('uploaded_documents'),
      countByStatus('uploaded_documents', 'validation_status', 'approved'),
      countByStatus('uploaded_documents', 'validation_status', 'rejected'),
      countByStatus('uploaded_documents', 'validation_status', 'pending'),
      countCurrent('subcontractor_documents'),
      countByStatus('subcontractor_documents', 'status', 'approved'),
      countByStatus('subcontractor_documents', 'status', 'rejected'),
      countByStatus('subcontractor_documents', 'status', 'pending'),
      supabase.from('transportistas').select('ariztia, lts, rendic, interpolar'),
    ])

    if (transportistasResult.error) throw transportistasResult.error

    const certificationFlags = (transportistasResult.data || []) as TransportistaCertificationFlags[]
    const totalCertifications = certificationFlags.reduce((total, transportista) => {
      return total + [transportista.ariztia, transportista.lts, transportista.rendic, transportista.interpolar]
        .filter(Boolean).length
    }, 0)

    const stats = {
      conductores: {
        total: conductorTotal,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
        vencidos: 0,
      },
      subcontratistas: {
        total: subcontractorTotal,
        pendientes: subcontractorPending,
        aprobados: subcontractorApproved,
        rechazados: subcontractorRejected,
        vencidos: 0,
      },
      certificaciones: {
        total: totalCertifications,
        vigentes: totalCertifications,
        porVencer: 0,
        vencidas: 0,
      },
    }

    const response = NextResponse.json({ stats, timestamp: new Date().toISOString() })
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Stats API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
