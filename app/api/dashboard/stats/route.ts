import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // NOTE: Using admin client to get actual counts without RLS restrictions
    // We'll use the EXACT same queries as the aprobados endpoint to ensure consistency
    
    // Get approved conductor documents
    const { data: approvedConductor } = await supabase
      .from('uploaded_documents')
      .select('id')
      .eq('validation_status', 'approved')
    
    // Get approved subcontractor documents  
    const { data: approvedSub } = await supabase
      .from('subcontractor_documents')
      .select('id')
      .eq('status', 'approved')

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

    const conductorApproved = approvedConductor?.length || 0
    const subApproved = approvedSub?.length || 0
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
