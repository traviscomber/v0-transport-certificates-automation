import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/verify-approved-sync
 * Verify that all documents shown as "approved" in the endpoint actually have approved status in DB
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    // Get all conductor documents with approved status
    const { data: conductorApproved } = await adminClient
      .from('uploaded_documents')
      .select('id, original_filename, validation_status, updated_at')
      .eq('validation_status', 'approved')
      .limit(100)

    // Get all subcontractor documents with approved status
    const { data: subApproved } = await adminClient
      .from('subcontractor_documents')
      .select('id, file_name, status, updated_at')
      .eq('status', 'approved')
      .limit(100)

    // Count total pending (should not appear in approved endpoint)
    const { count: conductorPendingCount } = await adminClient
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .eq('validation_status', 'pending')

    const { count: subPendingCount } = await adminClient
      .from('subcontractor_documents')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    // Fetch from approved endpoint
    let approvedEndpointData: any = null
    try {
      const response = await fetch('http://localhost:3000/api/company/documents/aprobados', {
        method: 'GET',
      })
      if (response.ok) {
        approvedEndpointData = await response.json()
      }
    } catch (e) {
      console.log('Could not fetch approved endpoint')
    }

    return NextResponse.json({
      database_state: {
        conductor_approved: {
          count: conductorApproved?.length || 0,
          latest: conductorApproved?.slice(0, 3),
        },
        subcontractor_approved: {
          count: subApproved?.length || 0,
          latest: subApproved?.slice(0, 3),
        },
        pending: {
          conductor_pending_count: conductorPendingCount || 0,
          subcontractor_pending_count: subPendingCount || 0,
        },
      },
      endpoint_response: approvedEndpointData ? {
        conductor_docs_count: approvedEndpointData.conductorDocs?.length || 0,
        sub_docs_count: approvedEndpointData.subDocs?.length || 0,
        total_docs_count: approvedEndpointData.allDocs?.length || 0,
      } : 'Failed to fetch',
      verification: {
        conductor_match: (conductorApproved?.length || 0) === (approvedEndpointData?.conductorDocs?.length || 0),
        subcontractor_match: (subApproved?.length || 0) === (approvedEndpointData?.subDocs?.length || 0),
        total_match: (
          (conductorApproved?.length || 0) + (subApproved?.length || 0)
        ) === (approvedEndpointData?.allDocs?.length || 0),
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Verify sync error:', msg)
    return NextResponse.json({ 
      error: msg
    }, { status: 500 })
  }
}
