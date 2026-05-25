import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
// Force cache bust: Updated 2026-05-25 to align approved counts with aprobados endpoint

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get TOTAL counts for all documents (used to compute approved = total - pending - rejected)
    const { data: allConductor } = await supabase
      .from('uploaded_documents')
      .select('id')

    const { data: allSub } = await supabase
      .from('subcontractor_documents')
      .select('id')

    // For approved count, compute: total - pending - rejected
    // This ensures mathematical consistency and avoids discrepancies from direct queries
    const conductorTotal = (allConductor?.length || 0)
    const subTotal = (allSub?.length || 0)
    
    // Compute approved from totals
    const conductorApprovedComputed = conductorTotal - (pendingConductor?.length || 0) - (rejectedConductor?.length || 0)
    const subApprovedComputed = subTotal - (pendingSub?.length || 0) - (rejectedSub?.length || 0)
    
    const approvedConductor_count = Math.max(0, conductorApprovedComputed)
    const approvedSub_count = Math.max(0, subApprovedComputed)

    // Get pending documents
    const { data: pendingConductor } = await supabase
      .from('uploaded_documents')
      .select('id')
      .or('validation_status.eq.pending,validation_status.is.null')

    const { data: pendingSub } = await supabase
      .from('subcontractor_documents')
      .select('id')
      .eq('status', 'pending')

    // Get rejected documents
    const { data: rejectedConductor } = await supabase
      .from('uploaded_documents')
      .select('id')
      .eq('validation_status', 'rejected')

    const { data: rejectedSub } = await supabase
      .from('subcontractor_documents')
      .select('id')
      .eq('status', 'rejected')

    const conductorApproved = approvedConductor_count
    const subApproved = approvedSub_count
    const conductorPending = pendingConductor?.length || 0
    const subPending = pendingSub?.length || 0
    const conductorRejected = rejectedConductor?.length || 0
    const subRejected = rejectedSub?.length || 0

    // Calculate totals: sum of all three states (pending + approved + rejected)
    const pendingTotal = conductorPending + subPending
    const approvedTotal = conductorApproved + subApproved
    const rejectedTotal = conductorRejected + subRejected

    const totals = {
      total: pendingTotal + approvedTotal + rejectedTotal,
      pending: pendingTotal,
      approved: approvedTotal,
      rejected: rejectedTotal,
    }

    console.log('[v0] Stats API - Document counts:', {
      approvedConductor: approvedConductor?.length || 0,
      approvedSub: approvedSub?.length || 0,
      pendingConductor: pendingConductor?.length || 0,
      pendingSub: pendingSub?.length || 0,
      rejectedConductor: rejectedConductor?.length || 0,
      rejectedSub: rejectedSub?.length || 0,
    })

    const stats = {
      conductores: {
        total: conductorApproved + conductorPending + conductorRejected,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
      },
      subcontratistas: {
        total: subApproved + subPending + subRejected,
        pendientes: subPending,
        aprobados: subApproved,
        rechazados: subRejected,
      },
      totals: totals
    }

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
