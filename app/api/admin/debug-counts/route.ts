import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Count WITH limit (stats endpoint style)
    const { data: withLimitData, count: withLimitCount } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })

    // Count WITHOUT limit but filter
    const { data: pendingOnly } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })
      .eq('status', 'pending')

    // Count ALL (no filter)
    const { count: totalCount } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })

    return NextResponse.json({
      with_limit_count: withLimitCount,
      pending_only: pendingOnly?.length || 0,
      total_all_count: totalCount,
      statuses_distribution: {
        pending: (withLimitData || []).filter(d => d.status === 'pending').length,
        approved: (withLimitData || []).filter(d => d.status === 'approved').length,
        rejected: (withLimitData || []).filter(d => d.status === 'rejected').length,
        null_status: (withLimitData || []).filter(d => d.status === null).length,
        other: (withLimitData || []).filter(d => !['pending', 'approved', 'rejected', null].includes(d.status)).length,
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
