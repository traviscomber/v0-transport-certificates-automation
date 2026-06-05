import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get with eq filter
    const { data: withEq, count: countEq } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })
      .eq('status', 'pending')

    // Get all and analyze
    const { data: all } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })

    // Count by exact value
    const statusCounts: Record<string, number> = {}
    all?.forEach(doc => {
      const status = doc.status
      statusCounts[`"${status}"`] = (statusCounts[`"${status}"`] || 0) + 1
    })

    // Check for null/undefined
    const nullCount = all?.filter(d => d.status === null).length || 0
    const undefinedCount = all?.filter(d => d.status === undefined).length || 0

    return NextResponse.json({
      with_eq_pending: {
        count: countEq,
        first_5: (withEq || []).slice(0, 5).map((d: any) => ({ status: `"${d.status}"`, raw: d.status }))
      },
      all_status_values: statusCounts,
      null_count: nullCount,
      undefined_count: undefinedCount,
      total_in_all: all?.length,
      pending_in_js_filter: all?.filter((d: any) => d.status === 'pending').length
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
