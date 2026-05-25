import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get ALL conductor documents with validation_status = 'approved'
    // Use full select like the endpoint to ensure consistency
    const { data: approvedConductor, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact' })
      .eq('validation_status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (conductorError) {
      console.error('[v0] Error fetching approved conductor docs:', conductorError)
    }

    // Get ALL subcontractor documents with status = 'approved'
    // Use full select like the endpoint to ensure consistency
    const { data: approvedSub, error: subError } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (subError) {
      console.error('[v0] Error fetching approved subcontractor docs:', subError)
    }

    // Get pending documents from uploaded_documents (no status or status='pending')
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

    // Get totals
    const { data: allConductor } = await supabase
      .from('uploaded_documents')
      .select('id')

    const { data: allSub } = await supabase
      .from('subcontractor_documents')
      .select('id')

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

    console.log('[v0] Stats API - Raw approved counts:', {
      conductorDocs: approvedConductor?.length || 0,
      subDocs: approvedSub?.length || 0,
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
