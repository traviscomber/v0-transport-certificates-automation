import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

const ELIGIBLE_STATUSES = new Set(['pending', 'ocr_required', 'failed', 'queued_retry'])

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: candidates, error: candidateError } = await supabase
    .from('subcontractor_documents')
    .select('id, file_name, created_at')
    .eq('is_current', true)
    .ilike('file_name', '%.pdf')
    .order('created_at', { ascending: true })
    .limit(25)

  if (candidateError) {
    return NextResponse.json({ stage: 'candidate_query', error: candidateError.message }, { status: 500 })
  }

  for (const candidate of candidates ?? []) {
    const { data: extraction, error: extractionError } = await supabase
      .from('document_text_extractions')
      .select('status')
      .eq('document_id', candidate.id)
      .maybeSingle()

    if (extractionError) {
      return NextResponse.json({ stage: 'extraction_query', documentId: candidate.id, error: extractionError.message }, { status: 500 })
    }

    const status = String(extraction?.status ?? 'pending')
    if (!ELIGIBLE_STATUSES.has(status)) continue

    const target = new URL('/api/pdf-ocr', request.nextUrl.origin)
    target.searchParams.set('documentId', candidate.id)

    const headers: Record<string, string> = {}
    const secret = process.env.CRON_SECRET
    if (secret) headers.authorization = `Bearer ${secret}`

    const response = await fetch(target, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })
    const body = await response.text()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }

  return NextResponse.json({ status: 'idle', reason: 'No eligible PDF documents found' })
}
