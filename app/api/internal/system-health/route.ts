import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const [
    { data: health, error: healthError },
    { data: ocrQueue, error: queueError },
    { data: failedExtractions, error: failedError },
  ] = await Promise.all([
    supabase.from('compliance_system_health').select('*').single(),
    supabase.from('ocr_priority_queue').select('*').limit(25),
    supabase
      .from('document_text_extractions')
      .select('document_id,status,extraction_method,text_length,error_message,attempts,processed_at,updated_at')
      .eq('status', 'failed')
      .order('updated_at', { ascending: false })
      .limit(20),
  ])

  if (healthError || queueError || failedError) {
    return NextResponse.json(
      {
        error:
          healthError?.message ??
          queueError?.message ??
          failedError?.message ??
          'System health query failed',
      },
      { status: 500 },
    )
  }

  const documentIds = (failedExtractions ?? []).map((item) => item.document_id)
  const { data: failedDocuments, error: documentsError } = documentIds.length
    ? await supabase
        .from('subcontractor_documents')
        .select('id,file_name,file_url,subcontractor_id,subcontractor_rut,document_period_start,is_current,status')
        .in('id', documentIds)
    : { data: [], error: null }

  if (documentsError) {
    return NextResponse.json({ error: documentsError.message }, { status: 500 })
  }

  const documentsById = new Map((failedDocuments ?? []).map((document) => [document.id, document]))
  const failedDocumentExtractions = (failedExtractions ?? []).map((extraction) => ({
    ...extraction,
    document: documentsById.get(extraction.document_id) ?? null,
  }))

  return NextResponse.json({
    ok: true,
    health,
    ocrQueue,
    failedDocumentExtractions,
  })
}
