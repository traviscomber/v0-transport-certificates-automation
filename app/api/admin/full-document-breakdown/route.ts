import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get ALL subcontractor documents with NO filters - just count by status
    const { data: allSub } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })
      .limit(10000)

    // Count by status
    const statusCounts: Record<string, number> = {}
    const nullCount = allSub?.filter(d => d.status === null).length || 0
    const undefinedCount = allSub?.filter(d => d.status === undefined).length || 0
    
    allSub?.forEach(d => {
      const status = d.status || 'NULL'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    // Get conductor documents
    const { data: allCond } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { head: false })
      .limit(10000)

    const condStatusCounts: Record<string, number> = {}
    const condNullCount = allCond?.filter(d => d.validation_status === null).length || 0
    
    allCond?.forEach(d => {
      const status = d.validation_status || 'NULL'
      condStatusCounts[status] = (condStatusCounts[status] || 0) + 1
    })

    return NextResponse.json({
      subcontractor_breakdown: {
        total_records: allSub?.length || 0,
        by_status: statusCounts,
        null_count: nullCount
      },
      conductor_breakdown: {
        total_records: allCond?.length || 0,
        by_status: condStatusCounts,
        null_count: condNullCount
      },
      grand_total: (allSub?.length || 0) + (allCond?.length || 0),
      sum_check: {
        sub_pending: statusCounts['pending'] || 0,
        sub_approved: statusCounts['approved'] || 0,
        sub_rejected: statusCounts['rejected'] || 0,
        sub_null: nullCount,
        sub_total: (statusCounts['pending'] || 0) + (statusCounts['approved'] || 0) + (statusCounts['rejected'] || 0) + nullCount
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
