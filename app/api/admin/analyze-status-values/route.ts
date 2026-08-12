import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabase = createAdminClient()

    const { data: withEq, count: countEq } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })
      .eq('status', 'pending')

    const { data: all } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })

    const statusCounts: Record<string, number> = {}
    all?.forEach((doc) => {
      const status = doc.status
      statusCounts[`"${status}"`] = (statusCounts[`"${status}"`] || 0) + 1
    })

    const nullCount = all?.filter((d) => d.status === null).length || 0
    const undefinedCount = all?.filter((d) => d.status === undefined).length || 0

    return NextResponse.json({
      with_eq_pending: {
        count: countEq,
        first_5: (withEq || []).slice(0, 5).map((d) => ({ status: `"${d.status}"`, raw: d.status })),
      },
      all_status_values: statusCounts,
      null_count: nullCount,
      undefined_count: undefinedCount,
      total_in_all: all?.length,
      pending_in_js_filter: all?.filter((d) => d.status === 'pending').length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
