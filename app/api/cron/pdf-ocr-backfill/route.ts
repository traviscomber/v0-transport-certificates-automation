import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

const DOCUMENTS_PER_RUN = 3

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()

  const { data: recovered, error: recoveryError } = await supabase.rpc('recover_stale_pdf_ocr_processing', {
    p_stale_minutes: 20,
  })
  if (recoveryError) {
    return NextResponse.json({ stage: 'stale_recovery', error: recoveryError.message }, { status: 500 })
  }

  const { data: claimed, error: claimError } = await supabase.rpc('claim_pdf_ocr_documents', {
    p_limit: DOCUMENTS_PER_RUN,
  })
  if (claimError) {
    return NextResponse.json({ stage: 'claim', error: claimError.message }, { status: 500 })
  }

  const documents = (claimed ?? []).map((row: { document_id: string }) => row.document_id).filter(Boolean)
  if (documents.length === 0) {
    return NextResponse.json({
      status: 'idle',
      recovered: Number(recovered ?? 0),
      reason: 'No eligible PDF documents found',
      durationMs: Date.now() - startedAt,
    })
  }

  const headers: Record<string, string> = {}
  const secret = process.env.CRON_SECRET
  if (secret) headers.authorization = `Bearer ${secret}`

  const results: Array<Record<string, unknown>> = []

  for (const documentId of documents) {
    const target = new URL('/api/pdf-ocr', request.nextUrl.origin)
    target.searchParams.set('documentId', documentId)

    try {
      const response = await fetch(target, {
        method: 'GET',
        headers,
        cache: 'no-store',
      })
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>
      results.push({
        documentId,
        ok: response.ok,
        httpStatus: response.status,
        ...payload,
      })
    } catch (error) {
      results.push({
        documentId,
        ok: false,
        httpStatus: 500,
        error: error instanceof Error ? error.message : 'PDF OCR request failed',
      })
    }
  }

  const succeeded = results.filter((result) => result.ok === true).length
  const failed = results.length - succeeded
  const status = failed === 0 ? 200 : succeeded > 0 ? 207 : 500

  return NextResponse.json({
    status: failed === 0 ? 'completed' : succeeded > 0 ? 'partial' : 'failed',
    claimed: documents.length,
    recovered: Number(recovered ?? 0),
    succeeded,
    failed,
    results,
    durationMs: Date.now() - startedAt,
  }, { status })
}
