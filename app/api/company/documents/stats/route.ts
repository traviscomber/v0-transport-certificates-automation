export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/stats
 * Returns document statistics for the dashboard
 * Includes counts for pendientes, aprobados, rechazados per module
 */

import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      console.log('[v0] Stats endpoint: Unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    console.log('[v0] Stats endpoint: Fetching document statistics for user:', user.email)

    // Get conductor documents stats
    const { data: conductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { count: 'exact', head: false })

    if (conductorError) {
      console.error('[v0] Stats endpoint: Error fetching conductor docs:', conductorError)
      throw new Error(`Conductor docs error: ${conductorError.message}`)
    }

    const conductorStats = {
      total: conductorDocs?.length || 0,
      pendientes: (conductorDocs || []).filter(d => d.validation_status === 'pending' || !d.validation_status).length,
      aprobados: (conductorDocs || []).filter(d => d.validation_status === 'approved').length,
      rechazados: (conductorDocs || []).filter(d => d.validation_status === 'rejected').length,
      vencidos: 0
    }

    // Get subcontractor documents stats
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })

    const subStats = {
      total: subDocs?.length || 0,
      pendientes: (subDocs || []).filter(d => d.status === 'pendiente' || !d.status).length,
      aprobados: (subDocs || []).filter(d => d.status === 'aprobado').length,
      rechazados: (subDocs || []).filter(d => d.status === 'rechazado').length,
      vencidos: 0
    }

    // Get certification stats
    const { data: certs, error: certError } = await supabase
      .from('certificaciones')
      .select('estado', { count: 'exact', head: false })

    const certStats = {
      total: certs?.length || 0,
      vigentes: (certs || []).filter(c => c.estado === 'vigente').length,
      porVencer: 0,
      vencidas: (certs || []).filter(c => c.estado === 'vencido').length
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      certificaciones: certStats
    }

    console.log('[v0] Stats endpoint: Returning updated stats', stats)

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[v0] Stats endpoint: Error:', error instanceof Error ? error.message : error)
    console.error('[v0] Stats endpoint: Stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching stats' },
      { status: 500 }
    )
  }
}
