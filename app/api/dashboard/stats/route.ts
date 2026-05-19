import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()

    // Get ALL conductor documents (no pagination limit)
    const { data: allConductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { head: false })

    if (conductorError) {
      console.error('[v0] Error fetching conductor docs:', conductorError)
    }

    const conductorPending = (allConductorDocs || []).filter(d => d.validation_status === 'pending' || !d.validation_status).length
    const conductorApproved = (allConductorDocs || []).filter(d => d.validation_status === 'approved').length
    const conductorRejected = (allConductorDocs || []).filter(d => d.validation_status === 'rejected').length

    // Get ALL subcontractor documents (no pagination limit)
    const { data: allSubDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })

    if (subError) {
      console.error('[v0] Error fetching subcontractor docs:', subError)
    }

    const subPending = (allSubDocs || []).filter(d => d.status === 'pending').length
    const subApproved = (allSubDocs || []).filter(d => d.status === 'approved').length
    const subRejected = (allSubDocs || []).filter(d => d.status === 'rejected').length

    // Calculate totals
    const totals = {
      total: (allConductorDocs?.length || 0) + (allSubDocs?.length || 0),
      pending: conductorPending + subPending,
      approved: conductorApproved + subApproved,
      rejected: conductorRejected + subRejected,
    }

    console.log('[v0] Stats API - Total docs fetched:', totals.total)
    console.log('[v0] Stats API - Approved: conductor', conductorApproved, '+ sub', subApproved, '= total', totals.approved)

    const stats = {
      conductores: {
        total: allConductorDocs?.length || 0,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
      },
      subcontratistas: {
        total: allSubDocs?.length || 0,
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
