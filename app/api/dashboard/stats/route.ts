import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get ALL documents without filters for totals and pending/rejected counts
    const { data: allConductor } = await supabase
      .from('uploaded_documents')
      .select('id, validation_status')
    
    const { data: allSub } = await supabase
      .from('subcontractor_documents')
      .select('id, status')

    // Count by status for totals/pending/rejected
    const conductorStats = {
      total: allConductor?.length || 0,
      pendientes: allConductor?.filter((d: any) => d.validation_status === 'pending' || !d.validation_status).length || 0,
      aprobados: allConductor?.filter((d: any) => d.validation_status === 'approved').length || 0,
      rechazados: allConductor?.filter((d: any) => d.validation_status === 'rejected').length || 0,
      vencidos: 0
    }

    const subStats = {
      total: allSub?.length || 0,
      pendientes: allSub?.filter((d: any) => d.status === 'pending').length || 0,
      aprobados: allSub?.filter((d: any) => d.status === 'approved').length || 0,
      rechazados: allSub?.filter((d: any) => d.status === 'rejected').length || 0,
      vencidos: 0
    }

    // ===== Use exact same query logic as aprobados endpoint =====
    // This ensures we get the EXACT same count as shown in the details page
    let approvedCount = (conductorStats.aprobados || 0) + (subStats.aprobados || 0)
    let detailedApprovedCount = 0
    
    try {
      // Query using exact same filters as aprobados endpoint - with .select('*') to match exactly
      const { data: approvedConductor } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('validation_status', 'approved')
      
      const { data: approvedSub } = await supabase
        .from('subcontractor_documents')
        .select('*')
        .eq('status', 'approved')
      
      // ALSO query ALL subcontractor docs to understand the data
      const { data: allSubForComparison } = await supabase
        .from('subcontractor_documents')
        .select('id, status')
      
      detailedApprovedCount = (approvedConductor?.length || 0) + (approvedSub?.length || 0)
      
      console.log('[v0] Stats API: Debug - Full comparison:', {
        conductor_approved: approvedConductor?.length || 0,
        sub_approved: approvedSub?.length || 0,
        sub_all_count: allSubForComparison?.length || 0,
        sub_approved_by_status: approvedSub?.filter((d: any) => d.status === 'approved').length || 0,
        total_detailed: detailedApprovedCount,
        all_sub_statuses: allSubForComparison ? {
          approved: allSubForComparison.filter(d => d.status === 'approved').length,
          pending: allSubForComparison.filter(d => d.status === 'pending').length,
          rejected: allSubForComparison.filter(d => d.status === 'rejected').length,
          null: allSubForComparison.filter(d => !d.status).length
        } : 'N/A'
      })
    } catch (e) {
      console.log('[v0] Stats API: Error in detailed approved query:', e)
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      totals: {
        total: (conductorStats.total || 0) + (subStats.total || 0),
        pending: (conductorStats.pendientes || 0) + (subStats.pendientes || 0),
        approved: detailedApprovedCount > 0 ? detailedApprovedCount : approvedCount,
        rejected: (conductorStats.rechazados || 0) + (subStats.rechazados || 0),
      }
    }

    console.log('[v0] Stats API - Final counts:', {
      conductorAprobados: conductorStats.aprobados,
      subAprobados: subStats.aprobados,
      approvedFromDetailedQueries: detailedApprovedCount,
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
