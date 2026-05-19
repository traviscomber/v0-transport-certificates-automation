import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check total uploaded_documents
    const { data: total, count: totalCount } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: false })

    // Check pending documents (no validation_status or validation_status = pending)
    const { data: pending } = await supabase
      .from('uploaded_documents')
      .select('id, original_filename, validation_status')
      .or('validation_status.eq.pending,validation_status.is.null')
      .limit(10)

    // Check all statuses distribution
    const { data: approved } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: false })
      .eq('validation_status', 'approved')

    const { data: rejected } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: false })
      .eq('validation_status', 'rejected')

    return NextResponse.json({
      summary: {
        total_documents: totalCount || 0,
        pending_documents: pending?.length || 0,
        approved_documents: approved?.length || 0,
        rejected_documents: rejected?.length || 0,
        other_status: (totalCount || 0) - (pending?.length || 0) - (approved?.length || 0) - (rejected?.length || 0)
      },
      pending_samples: pending || [],
      message: (pending?.length || 0) === 0 ? '⚠️ NO PENDING DOCUMENTS FROM CONDUCTORS' : `${pending?.length} pending documents found`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
