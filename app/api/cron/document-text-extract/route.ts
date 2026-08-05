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

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const bearer = request.headers.get('authorization')
  const isVercelCron = request.headers.get('user-agent') === 'vercel-cron/1.0'
  return Boolean(isVercelCron || !secret || bearer === `Bearer ${secret}`)
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
    const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    await supabase
      .from('document_text_extractions')
      .update({ status: 'pending', error_message: 'stale_processing_recovered', updated_at: new Date().toISOString() })
      .eq('status', 'processing')
      .lt('updated_at', staleBefore)

    const { data: queue, error: queueError } = await supabase
      .from('document_text_extractions')
      .select('document_id, attempts')
      .in('status', ['pending', 'failed'])
      .lt('attempts', 3)
      .order('updated_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (queueError) throw queueError
    if (!queue?.length) return NextResponse.json({ status: 'complete', processed: 0, durationMs: Date.now() - startedAt })

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
      const now = new Date().toISOString()
      await supabase
        .from('document_text_extractions')
        .update({ status: 'processing', attempts: (item.attempts ?? 0) + 1, updated_at: now })
        .eq('document_id', item.document_id)

      try {
        if (!doc?.file_url) throw new Error('missing_file_url')
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
            .update({ ai_extracted_text: rawText, updated_at: now })
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
            processed_at: now,
            updated_at: now,
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
