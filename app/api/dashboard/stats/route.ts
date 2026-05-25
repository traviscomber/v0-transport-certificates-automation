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

    // Get approved documents using aprobados endpoint logic
    const { data: approvedConductor, count: conductorApprovedCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .eq('validation_status', 'approved')
    
    const { data: approvedSub, count: subApprovedCount } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')

    const conductorApproved = conductorApprovedCount || 0
    const subApproved = subApprovedCount || 0

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

    // Calculate totals using mathematical consistency:
    // total = approved + pending + rejected
    const totalDocs = conductorTotal + subTotal
    const approvedDocs = conductorApproved + subApproved
    const pendingDocs = conductorPending + subPending
    const rejectedDocs = conductorRejected + subRejected
    
    // Verify math adds up
    const calculatedTotal = approvedDocs + pendingDocs + rejectedDocs
    const discrepancy = totalDocs - calculatedTotal

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      totals: {
        total: totalDocs,
        pending: pendingDocs,
        approved: approvedDocs,
        rejected: rejectedDocs,
      }
    }

    console.log('[v0] Stats API - Final counts:', {
      totalDocs,
      pendingDocs,
      approvedDocs,
      rejectedDocs,
      calculatedTotal,
      discrepancy,
      math_check: `${approvedDocs} + ${pendingDocs} + ${rejectedDocs} = ${calculatedTotal}`
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
