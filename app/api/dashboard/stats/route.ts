import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get conductor documents stats - PAGINATE for all records (same as documentos page)
    const { data: conductorPage0 } = await supabase
      .from("uploaded_documents")
      .select("id, validation_status")
      .range(0, 999)
    
    const { data: conductorPage1 } = await supabase
      .from("uploaded_documents")
      .select("id, validation_status")
      .range(1000, 1999)

    const allConductorDocs = [...(conductorPage0 || []), ...(conductorPage1 || [])]
    
    const conductorStats = {
      total: allConductorDocs.length,
      pendientes: allConductorDocs.filter(d => d.validation_status === 'pending' || !d.validation_status).length,
      aprobados: allConductorDocs.filter(d => d.validation_status === 'approved').length,
      rechazados: allConductorDocs.filter(d => d.validation_status === 'rejected').length,
      vencidos: 0
    }

    // Get subcontractor documents stats - PAGINATE for all records (same as documentos page)
    const { data: subPage0 } = await supabase
      .from("subcontractor_documents")
      .select("id, status")
      .range(0, 999)

    const { data: subPage1 } = await supabase
      .from("subcontractor_documents")
      .select("id, status")
      .range(1000, 1999)

    const allSubDocs = [...(subPage0 || []), ...(subPage1 || [])]
    
    const subStats = {
      total: allSubDocs.length,
      pendientes: allSubDocs.filter(d => d.status === 'pending').length,
      aprobados: allSubDocs.filter(d => d.status === 'approved').length,
      rechazados: allSubDocs.filter(d => d.status === 'rejected').length,
      vencidos: 0
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      totals: {
        total: (conductorStats.total || 0) + (subStats.total || 0),
        pending: (conductorStats.pendientes || 0) + (subStats.pendientes || 0),
        approved: (conductorStats.aprobados || 0) + (subStats.aprobados || 0),
        rejected: (conductorStats.rechazados || 0) + (subStats.rechazados || 0),
      }
    }

    console.log('[v0] Stats API - Computed:', {
      conductorAprobados: conductorStats.aprobados,
      subAprobados: subStats.aprobados,
      totalAprobados: stats.totals.approved
    })

    return NextResponse.json({ stats }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('[v0] Error in /api/dashboard/stats:', error.message)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
