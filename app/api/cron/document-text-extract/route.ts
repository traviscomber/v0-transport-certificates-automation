import { createHash, randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const BATCH_SIZE = 12
const LOCK_NAME = 'document_text_extract'
const LOCK_LEASE_SECONDS = 360
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const bearer = request.headers.get('authorization')
  const isVercelCron = request.headers.get('user-agent') === 'vercel-cron/1.0'
  return Boolean(isVercelCron || !secret || bearer === `Bearer ${secret}`)
}

function isImageDocument(fileName?: string | null, fileUrl?: string | null): boolean {
  const normalizedName = String(fileName ?? '').split('?')[0]
  const normalizedUrl = String(fileUrl ?? '').split('?')[0]
  return IMAGE_EXTENSION.test(normalizedName) || IMAGE_EXTENSION.test(normalizedUrl)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const startedAt = Date.now()
  const supabase = createAdminClient()
  const ownerToken = randomUUID()
  const { data: acquired, error: lockError } = await supabase.rpc('acquire_system_job_lock', {
    p_job_name: LOCK_NAME,
    p_owner_token: ownerToken,
    p_lease_seconds: LOCK_LEASE_SECONDS,
  })

  if (lockError) return NextResponse.json({ error: lockError.message }, { status: 500 })
  if (!acquired) return NextResponse.json({ status: 'skipped', reason: 'already_running' })

  try {
    const now = new Date().toISOString()
    const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    await supabase
      .from('document_text_extractions')
      .update({ status: 'pending', error_message: 'stale_processing_recovered', updated_at: now })
      .eq('status', 'processing')
      .lt('updated_at', staleBefore)

    // Correct legacy image rows that were sent to the PDF parser before format detection existed.
    const { data: legacyFailures } = await supabase
      .from('document_text_extractions')
      .select('document_id, subcontractor_documents!inner(file_name, file_url)')
      .eq('status', 'failed')
      .eq('error_message', 'Invalid PDF structure.')
      .limit(100)

    const legacyImageIds = (legacyFailures ?? [])
      .filter((row) => {
        const document = Array.isArray(row.subcontractor_documents)
          ? row.subcontractor_documents[0]
          : row.subcontractor_documents
        return isImageDocument(document?.file_name, document?.file_url)
      })
      .map((row) => row.document_id)

    if (legacyImageIds.length > 0) {
      await supabase
        .from('document_text_extractions')
        .update({
          status: 'ocr_required',
          extraction_method: 'image_requires_ocr',
          error_message: null,
          processed_at: now,
          updated_at: now,
        })
        .in('document_id', legacyImageIds)
    }

    const { data: queue, error: queueError } = await supabase
      .from('document_text_extractions')
      .select('document_id, attempts')
      .in('status', ['pending', 'failed'])
      .lt('attempts', 3)
      .order('updated_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (queueError) throw queueError
    if (!queue?.length) {
      return NextResponse.json({
        status: 'complete',
        processed: 0,
        legacyImagesReclassified: legacyImageIds.length,
        durationMs: Date.now() - startedAt,
      })
    }

    const ids = queue.map((row) => row.document_id)
    const { data: docs, error: docsError } = await supabase
      .from('subcontractor_documents')
      .select('id, file_url, file_name')
      .in('id', ids)

    if (docsError) throw docsError
    const byId = new Map((docs ?? []).map((doc) => [doc.id, doc]))
    const results: Array<Record<string, unknown>> = []

    for (const item of queue) {
      const doc = byId.get(item.document_id)
      const itemNow = new Date().toISOString()
      await supabase
        .from('document_text_extractions')
        .update({ status: 'processing', attempts: (item.attempts ?? 0) + 1, updated_at: itemNow })
        .eq('document_id', item.document_id)

      try {
        if (!doc?.file_url) throw new Error('missing_file_url')

        if (isImageDocument(doc.file_name, doc.file_url)) {
          await supabase
            .from('document_text_extractions')
            .update({
              status: 'ocr_required',
              extraction_method: 'image_requires_ocr',
              text_length: 0,
              text_hash: null,
              error_message: null,
              processed_at: itemNow,
              updated_at: itemNow,
            })
            .eq('document_id', item.document_id)
          results.push({ id: item.document_id, fileName: doc.file_name, status: 'ocr_required', textLength: 0 })
          continue
        }

        const response = await fetch(doc.file_url, { cache: 'no-store' })
        if (!response.ok) throw new Error(`download_http_${response.status}`)

        const bytes = new Uint8Array(await response.arrayBuffer())
        if (!bytes.byteLength) throw new Error('empty_file')

        const { text } = await extractText(bytes)
        const rawText = (Array.isArray(text) ? text.join('\n') : String(text ?? '')).replace(/\u0000/g, '').trim()
        const hasUsableText = rawText.length >= 40
        const textHash = hasUsableText ? createHash('sha256').update(rawText).digest('hex') : null
        const status = hasUsableText ? 'text_extracted' : 'ocr_required'

        if (hasUsableText) {
          const { error: updateDocError } = await supabase
            .from('subcontractor_documents')
            .update({ ai_extracted_text: rawText, updated_at: itemNow })
            .eq('id', item.document_id)
          if (updateDocError) throw updateDocError
        }

        await supabase
          .from('document_text_extractions')
          .update({
            status,
            extraction_method: 'unpdf_native',
            text_length: rawText.length,
            text_hash: textHash,
            error_message: null,
            processed_at: itemNow,
            updated_at: itemNow,
          })
          .eq('document_id', item.document_id)

        results.push({ id: item.document_id, fileName: doc.file_name, status, textLength: rawText.length })
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'unknown_error'
        await supabase
          .from('document_text_extractions')
          .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
          .eq('document_id', item.document_id)
        results.push({ id: item.document_id, status: 'failed', error: message })
      }
    }

    await supabase.rpc('sync_subcontractor_document_facts')
    await supabase.rpc('sync_worker_document_facts')
    await supabase.rpc('reconcile_company_workers')

    const summary = results.reduce<Record<string, number>>((acc, row) => {
      const key = String(row.status)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      status: 'processed',
      processed: results.length,
      legacyImagesReclassified: legacyImageIds.length,
      summary,
      results,
      durationMs: Date.now() - startedAt,
    })
  } finally {
    await supabase.rpc('release_system_job_lock', {
      p_job_name: LOCK_NAME,
      p_owner_token: ownerToken,
    })
  }
}
