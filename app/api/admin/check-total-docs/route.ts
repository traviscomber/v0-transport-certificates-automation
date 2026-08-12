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

    const { count: subTotalCount } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact', head: true })

    const { count: condTotalCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: true })

    const { data: page0 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(0, 999)

    const { data: page1 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(1000, 1999)

    const allSubDocs = [...(page0 || []), ...(page1 || [])]
    const breakdown: Record<string, number> = {}
    allSubDocs.forEach((doc) => {
      const status = doc.status || 'NULL'
      breakdown[status] = (breakdown[status] || 0) + 1
    })

    return NextResponse.json({
      total_count: {
        subcontractor_documents: subTotalCount,
        conductor_documents: condTotalCount,
      },
      pages_fetched: {
        page0_records: page0?.length || 0,
        page1_records: page1?.length || 0,
        total_fetched: allSubDocs.length,
      },
      breakdown_by_status: breakdown,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
