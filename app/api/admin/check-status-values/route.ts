import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/check-status-values
 * Check all distinct status values in both tables
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    // Get distinct status values from subcontractor_documents
    const { data: subStatuses } = await adminClient
      .from('subcontractor_documents')
      .select('status')

    const subStatusCounts: Record<string, number> = {}
    subStatuses?.forEach(doc => {
      const status = doc.status || 'NULL'
      subStatusCounts[status] = (subStatusCounts[status] || 0) + 1
    })

    // Get distinct status values from uploaded_documents
    const { data: conductorStatuses } = await adminClient
      .from('uploaded_documents')
      .select('validation_status')

    const conductorStatusCounts: Record<string, number> = {}
    conductorStatuses?.forEach(doc => {
      const status = doc.validation_status || 'NULL'
      conductorStatusCounts[status] = (conductorStatusCounts[status] || 0) + 1
    })

    return NextResponse.json({
      subcontractor_documents: {
        distinct_statuses: subStatusCounts,
        total: subStatuses?.length || 0,
      },
      uploaded_documents: {
        distinct_statuses: conductorStatusCounts,
        total: conductorStatuses?.length || 0,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
