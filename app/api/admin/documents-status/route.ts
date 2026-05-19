import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // CONDUCTORS
    const { count: totalConductor } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: false })

    const { count: conductorPending } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: false })
      .or('validation_status.eq.pending,validation_status.is.null')

    const { count: conductorApproved } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: false })
      .eq('validation_status', 'approved')

    const { count: conductorRejected } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: false })
      .eq('validation_status', 'rejected')

    // SUBCONTRACTORS
    const { count: totalSub } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: false })

    const { count: subPending } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: false })
      .eq('status', 'pending')

    const { count: subApproved } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: false })
      .eq('status', 'approved')

    const { count: subRejected } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: false })
      .eq('status', 'rejected')

    // Get recent uploads from conductors
    const { data: recentConductor } = await supabase
      .from('uploaded_documents')
      .select('original_filename, created_at, validation_status')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent uploads from subcontractors
    const { data: recentSub } = await supabase
      .from('subcontractor_documents')
      .select('file_name, uploaded_at, status')
      .order('uploaded_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      conductors: {
        total: totalConductor || 0,
        pending: conductorPending || 0,
        approved: conductorApproved || 0,
        rejected: conductorRejected || 0,
        recent_uploads: recentConductor
      },
      subcontractors: {
        total: totalSub || 0,
        pending: subPending || 0,
        approved: subApproved || 0,
        rejected: subRejected || 0,
        recent_uploads: recentSub
      },
      status: {
        conductors_upload_working: (totalConductor || 0) > 0 ? '✅ YES' : '❌ NO',
        subcontractors_upload_working: (totalSub || 0) > 0 ? '✅ YES' : '❌ NO',
        conductors_need_review: conductorPending === 0 ? '✅ All reviewed' : `⚠️ ${conductorPending} pending`,
        subcontractors_need_review: subPending === 0 ? '✅ All reviewed' : `⚠️ ${subPending} pending`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
