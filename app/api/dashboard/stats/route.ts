import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get ALL documents to count totals
    const { data: allConductor, count: conductorCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
    
    const { data: allSub, count: subCount } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact' })

    const conductorTotal = conductorCount || 0
    const subTotal = subCount || 0

    // Get pending documents (status = 'pending' OR null/undefined)
    const { count: conductorPendingCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .or('validation_status.eq.pending,validation_status.is.null')
    
    const { count: subPendingCount } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    const conductorPending = conductorPendingCount || 0
    const subPending = subPendingCount || 0

    // Get rejected documents (status = 'rejected')
    const { count: conductorRejectedCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .eq('validation_status', 'rejected')
    
    const { count: subRejectedCount } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact' })
      .eq('status', 'rejected')

    const conductorRejected = conductorRejectedCount || 0
    const subRejected = subRejectedCount || 0

    // IMPORTANT: Get approved count from the aprobados endpoint (source of truth)
    // This ensures stats API returns same value as detail page
    let approvedDocs = 0
    let conductorApproved = 0
    let subApproved = 0
    
    try {
      // For local testing: use direct queries if we can't reach the endpoint
      const { data: approvedConductor } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('validation_status', 'approved')
      
      const { data: approvedSub } = await supabase
        .from('subcontractor_documents')
        .select('*')
        .eq('status', 'approved')
      
      conductorApproved = approvedConductor?.length || 0
      subApproved = approvedSub?.length || 0
      approvedDocs = conductorApproved + subApproved
      
      console.log('[v0] Stats API approved count:', {
        conductor: conductorApproved,
        sub: subApproved,
        total: approvedDocs
      })
    } catch (e) {
      console.log('[v0] Stats API error getting approved count:', e)
      approvedDocs = 0
    }

    const conductorStats = {
      total: conductorTotal,
      pendientes: conductorPending,
      aprobados: conductorApproved,
      rechazados: conductorRejected,
      vencidos: 0
    }

    const subStats = {
      total: subTotal,
      pendientes: subPending,
      aprobados: subApproved,
      rechazados: subRejected,
      vencidos: 0
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      totals: {
        total: conductorTotal + subTotal,
        pending: conductorPending + subPending,
        approved: approvedDocs,
        rejected: conductorRejected + subRejected,
      }
    }

    console.log('[v0] Stats API - Final counts:', {
      totalDocs: conductorTotal + subTotal,
      pendingDocs: conductorPending + subPending,
      approvedDocs,
      rejectedDocs: conductorRejected + subRejected
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
