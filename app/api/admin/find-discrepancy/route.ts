import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/find-discrepancy
 * Find which documents are being counted twice or incorrectly
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    // Get ALL subcontractor approved documents
    const { data: subApprovedAll } = await adminClient
      .from('subcontractor_documents')
      .select('id, file_name, status')
      .eq('status', 'approved')

    // Get unique IDs
    const uniqueIds = new Set(subApprovedAll?.map(d => d.id) || [])
    
    console.log('[v0] Total subcontractor approved docs:', subApprovedAll?.length || 0)
    console.log('[v0] Unique IDs:', uniqueIds.size)
    console.log('[v0] Duplicates:', (subApprovedAll?.length || 0) - uniqueIds.size)

    // Find documents that appear multiple times
    const idCount: Record<string, number> = {}
    subApprovedAll?.forEach(d => {
      idCount[d.id] = (idCount[d.id] || 0) + 1
    })

    const duplicates = Object.entries(idCount)
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }))

    // Check if the endpoint is getting called correctly
    // Try to fetch the endpoint response
    let endpointSubs: any[] = []
    try {
      const response = await fetch('http://localhost:3000/api/company/documents/aprobados')
      if (response.ok) {
        const data = await response.json()
        endpointSubs = data.subDocs || []
      }
    } catch (e) {
      console.log('Could not fetch endpoint')
    }

    // Check for duplicates in endpoint response
    const endpointIds = new Set(endpointSubs.map(d => d.id))
    const endpointDuplicates = endpointSubs.length - endpointIds.size

    return NextResponse.json({
      database_findings: {
        total_records_from_query: subApprovedAll?.length || 0,
        unique_document_ids: uniqueIds.size,
        duplicate_records_in_db: (subApprovedAll?.length || 0) - uniqueIds.size,
        sample_duplicates: duplicates.slice(0, 5),
      },
      endpoint_findings: {
        total_returned: endpointSubs.length,
        unique_ids: endpointIds.size,
        duplicate_returns: endpointDuplicates,
        first_few_ids: Array.from(endpointIds).slice(0, 10),
      },
      mismatch_analysis: {
        db_has: uniqueIds.size,
        endpoint_returns: endpointIds.size,
        difference: endpointIds.size - uniqueIds.size,
        likely_cause: endpointIds.size > uniqueIds.size ? 'Duplicates in endpoint response' : 'Other issue',
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
