export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Use exact count queries (head: true) - avoids 1000-row limit and ordering issues
    const countByStatus = async (table: string, statusCol: string, status: string) => {
      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq(statusCol, status)
      return count || 0
    }

    const countTotal = async (table: string) => {
      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
      return count || 0
    }

    // Conductor document counts
    const [condTotal, condApproved, condRejected] = await Promise.all([
      countTotal('uploaded_documents'),
      countByStatus('uploaded_documents', 'validation_status', 'approved'),
      countByStatus('uploaded_documents', 'validation_status', 'rejected'),
    ])

    const conductorStats = {
      total: condTotal,
      pendientes: condTotal - condApproved - condRejected,
      aprobados: condApproved,
      rechazados: condRejected,
      vencidos: 0
    }

    // Subcontractor document counts
    const [subTotal, subApproved, subRejected, subPending] = await Promise.all([
      countTotal('subcontractor_documents'),
      countByStatus('subcontractor_documents', 'status', 'approved'),
      countByStatus('subcontractor_documents', 'status', 'rejected'),
      countByStatus('subcontractor_documents', 'status', 'pending'),
    ])

    const subStats = {
      total: subTotal,
      pendientes: subPending,
      aprobados: subApproved,
      rechazados: subRejected,
      vencidos: 0
    }

    console.log('[v0] Stats counts:', {
      conductorApproved: condApproved,
      subApproved: subApproved,
      totalApproved: condApproved + subApproved
    })

    // Get certification stats - use exact count to avoid 1000-row limit
    const { count: certsCount } = await supabase
      .from('transportistas')
      .select('id', { count: 'exact', head: true })

    const certStats = {
      total: certsCount || 0,
      vigentes: 0,
      porVencer: 0,
      vencidas: 0
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      certificaciones: certStats
    }

    const response = NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    return response

  } catch (error: any) {
    console.error('[v0] Stats API error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
