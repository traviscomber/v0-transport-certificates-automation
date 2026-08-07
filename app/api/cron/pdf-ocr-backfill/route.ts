import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

const DOCUMENTS_PER_RUN = 3
const PDF_OCR_TIMEOUT_MS = 90_000
const DEFAULT_PUBLIC_ORIGIN = 'https://transn3uralia.vercel.app'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

function publicOrigin(): string {
  const configured = process.env.PDF_OCR_PUBLIC_ORIGIN?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim()
  return (configured || DEFAULT_PUBLIC_ORIGIN).replace(/\/$/, '')
}

async function releaseClaim(
  supabase: ReturnType<typeof createAdminClient>,
  documentId: string,
  message: string,
) {
  const { error } = await supabase
    .from('document_text_extractions')
    .update({
      status: 'ocr_required',
      error_message: message.slice(0, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq('document_id', documentId)
    .eq('status', 'processing')

  if (error) throw error
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
  const origin = publicOrigin()

  for (const documentId of documents) {
    const target = new URL('/api/pdf-ocr', origin)
    target.searchParams.set('documentId', documentId)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PDF_OCR_TIMEOUT_MS)

    try {
      const response = await fetch(target, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal: controller.signal,
      })
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>

      if (!response.ok) {
        const errorMessage = typeof payload.error === 'string'
          ? payload.error
          : `PDF OCR returned HTTP ${response.status}`
        await releaseClaim(supabase, documentId, errorMessage)
      }

      results.push({
        documentId,
        ok: response.ok,
        httpStatus: response.status,
        ...payload,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PDF OCR request failed'
      await releaseClaim(supabase, documentId, `PDF OCR backfill subrequest failed: ${message}`)
      results.push({
        documentId,
        ok: false,
        httpStatus: 500,
        error: message,
      })
    } finally {
      clearTimeout(timeout)
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
