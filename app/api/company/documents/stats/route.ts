export const dynamic = 'force-dynamic'
export const revalidate = 30 // ISR: revalidate every 30 seconds

/**
 * GET /api/company/documents/stats
 * Returns document statistics for the dashboard
 * Includes counts for pendientes, aprobados, rechazados per module
 * SYNCED with /dashboard/company/documentos/pendientes logic
 * Cached for 30s with stale-while-revalidate for optimal performance
 */

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

    // Get conductor documents stats - SYNCED with pendientes page logic
    const { data: conductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { count: 'exact', head: false })

    if (conductorError) {
      throw new Error(`Conductor docs error: ${conductorError.message}`)
    }

    // Count pending: both 'pending' status AND null status (documents with no validation yet)
    const pendingCount = (conductorDocs || []).filter(d => 
      d.validation_status === 'pending' || d.validation_status === null
    ).length

    const conductorStats = {
      total: conductorDocs?.length || 0,
      pendientes: pendingCount,
      aprobados: (conductorDocs || []).filter(d => d.validation_status === 'approved').length,
      rechazados: (conductorDocs || []).filter(d => d.validation_status === 'rejected').length,
      vencidos: 0
    }

    // Get subcontractor documents stats
    const { data: subDocs } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })

    const subStats = {
      total: subDocs?.length || 0,
      pendientes: (subDocs || []).filter(d => d.status === 'pending' || d.status === null).length,
      aprobados: (subDocs || []).filter(d => d.status === 'approved').length,
      rechazados: (subDocs || []).filter(d => d.status === 'rejected').length,
      vencidos: 0
    }

    // Get certification stats
    const { data: certs } = await supabase
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

    const response = NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

    // Set cache headers for optimal performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    response.headers.set('Content-Type', 'application/json')

    return response

  } catch (error) {
    console.error('[v0] Stats endpoint error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching stats' },
      { status: 500 }
    )
  }
}
