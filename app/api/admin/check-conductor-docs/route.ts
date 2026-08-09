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

    const { count: totalCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: true })

    const { data: pending, count: pendingCount } = await supabase
      .from('uploaded_documents')
      .select('id, original_filename, validation_status', { count: 'exact' })
      .or('validation_status.eq.pending,validation_status.is.null')
      .limit(10)

    const { count: approvedCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: true })
      .eq('validation_status', 'approved')

    const { count: rejectedCount } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: true })
      .eq('validation_status', 'rejected')

    return NextResponse.json({
      summary: {
        total_documents: totalCount || 0,
        pending_documents: pendingCount || 0,
        approved_documents: approvedCount || 0,
        rejected_documents: rejectedCount || 0,
      },
      pending_samples: pending || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
