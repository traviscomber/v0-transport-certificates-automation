import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentLocally } from '@/lib/local-ocr'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_DOCUMENTS_PER_RUN = 1

type Semaphore = 'processing' | 'green' | 'yellow' | 'red'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

function inferMimeType(fileName: string | null, contentType: string | null): string {
  if (contentType) return contentType
  const normalized = String(fileName ?? '').toLowerCase()
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'
  if (normalized.endsWith('.webp')) return 'image/webp'
  return 'application/pdf'
}

function semaphoreForCanonicalStatus(status: string | null): Semaphore {
  if (status === 'matched') return 'green'
  if (status === 'owner_conflict' || status === 'failed') return 'red'
  if (status === 'no_candidate' || status === 'unmatched_prt' || status === 'queued_ocr') return 'yellow'
  return 'yellow'
}

async function triggerCanonicalRecovery(request: NextRequest, documentId: string) {
  const headers: Record<string, string> = {}
  if (process.env.CRON_SECRET) headers.authorization = `Bearer ${process.env.CRON_SECRET}`

  const response = await fetch(
    `${request.nextUrl.origin}/api/cron/vehicle-fleet-recovery?documentId=${encodeURIComponent(documentId)}`,
    { method: 'GET', headers, cache: 'no-store' },
  )

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()
  const results: Array<Record<string, unknown>> = []

  const { data: batch, error: batchError } = await supabase
    .from('ocr_processing_batches')
    .insert({
      source: 'document_ocr_cron',
      status: 'processing',
      total_documents: 0,
      metadata: { deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null },
    })
    .select('id')
    .single()

  if (batchError) {
    return NextResponse.json({ stage: 'batch_create', error: batchError.message }, { status: 500 })
  }

  let responseStatus = 200

  try {
    for (let index = 0; index < MAX_DOCUMENTS_PER_RUN; index += 1) {
      const { data: candidate, error: candidateError } = await supabase
        .from('ocr_priority_queue')
        .select('document_id, document_type, file_name, file_url, attempts, priority_score')
        .order('priority_score', { ascending: false })
        .order('updated_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (candidateError) throw new Error(candidateError.message)
      if (!candidate) break

      await supabase
        .from('ocr_processing_batches')
        .update({ total_documents: 1, updated_at: new Date().toISOString() })
        .eq('id', batch.id)

      const { error: batchDocumentError } = await supabase
        .from('ocr_batch_documents')
        .insert({
          batch_id: batch.id,
          document_id: candidate.document_id,
          status: 'processing',
          semaphore: 'processing',
          extraction_status: 'processing',
          metadata: {
            fileName: candidate.file_name,
            documentType: candidate.document_type,
            priorityScore: candidate.priority_score,
          },
        })

      if (batchDocumentError) throw new Error(batchDocumentError.message)

      const now = new Date().toISOString()
      const { data: locked, error: lockError } = await supabase
        .from('document_text_extractions')
        .update({
          status: 'processing',
          attempts: Number(candidate.attempts ?? 0) + 1,
          error_message: null,
          updated_at: now,
        })
        .eq('document_id', candidate.document_id)
        .eq('status', 'ocr_required')
        .select('document_id')
        .maybeSingle()

      if (lockError) throw new Error(lockError.message)
      if (!locked) continue

      try {
        const response = await fetch(candidate.file_url, { cache: 'no-store', redirect: 'follow' })
        if (!response.ok) throw new Error(`Document download failed with HTTP ${response.status}`)

        const contentLength = Number(response.headers.get('content-length') ?? 0)
        if (contentLength > MAX_FILE_BYTES) {
          throw new Error(`Document exceeds OCR size limit (${contentLength} bytes)`)
        }

        const buffer = await response.arrayBuffer()
        if (buffer.byteLength === 0) throw new Error('Document is empty')
        if (buffer.byteLength > MAX_FILE_BYTES) {
          throw new Error(`Document exceeds OCR size limit (${buffer.byteLength} bytes)`)
        }

        const mimeType = inferMimeType(candidate.file_name, response.headers.get('content-type'))
        const extraction = await extractDocumentLocally(
          new Uint8Array(buffer),
          candidate.document_type || 'DOCUMENTO',
          mimeType,
        )
        const engine = 'openai_vision_ocr'
        const extractedText = extraction.extractedText.trim()
        const analyzedAt = new Date().toISOString()

        const { error: documentError } = await supabase
          .from('subcontractor_documents')
          .update({
            ai_document_type: extraction.documentType,
            ai_expiration_date: extraction.expirationDate,
            ai_issuance_date: extraction.issuanceDate,
            ai_document_number: extraction.documentNumber,
            ai_extracted_text: extractedText,
            ai_confidence: extraction.confidence,
            ai_warnings: extraction.warnings,
            ai_analyzed_at: analyzedAt,
          })
          .eq('id', candidate.document_id)

        if (documentError) throw new Error(documentError.message)

        const { error: extractionError } = await supabase
          .from('document_text_extractions')
          .update({
            status: 'text_extracted',
            extraction_method: engine,
            text_length: extractedText.length,
            error_message: null,
            processed_at: analyzedAt,
            updated_at: analyzedAt,
          })
          .eq('document_id', candidate.document_id)

        if (extractionError) throw new Error(extractionError.message)

        await supabase
          .from('ocr_batch_documents')
          .update({
            status: 'extracted',
            extraction_status: 'text_extracted',
            metadata: {
              fileName: candidate.file_name,
              documentType: candidate.document_type,
              priorityScore: candidate.priority_score,
              textLength: extractedText.length,
              confidence: extraction.confidence,
              engine,
            },
            updated_at: analyzedAt,
          })
          .eq('batch_id', batch.id)
          .eq('document_id', candidate.document_id)

        const recovery = await triggerCanonicalRecovery(request, candidate.document_id)
        const { data: scan } = await supabase
          .from('vehicle_document_scans')
          .select('status, candidate_count, matched_count, error_message, scanned_at')
          .eq('document_id', candidate.document_id)
          .maybeSingle()

        const canonicalStatus = scan?.status ?? (recovery.ok ? 'pending' : 'failed')
        const semaphore = semaphoreForCanonicalStatus(canonicalStatus)
        const canonicalized = Boolean(scan)
        const completedAt = new Date().toISOString()

        await supabase
          .from('ocr_batch_documents')
          .update({
            status: canonicalized ? 'canonicalized' : recovery.ok ? 'extracted' : 'failed',
            semaphore,
            canonical_status: canonicalStatus,
            error_message: scan?.error_message ?? (recovery.ok ? null : recovery.body.slice(0, 1000)),
            completed_at: canonicalized || !recovery.ok ? completedAt : null,
            updated_at: completedAt,
          })
          .eq('batch_id', batch.id)
          .eq('document_id', candidate.document_id)

        if (!canonicalized) responseStatus = recovery.ok ? 202 : 500

        results.push({
          documentId: candidate.document_id,
          fileName: candidate.file_name,
          status: 'text_extracted',
          canonicalStatus,
          semaphore,
          canonicalized,
          textLength: extractedText.length,
          confidence: extraction.confidence,
          pagesProcessed: extraction.pagesProcessed,
          engine,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown local OCR error'
        const failedAt = new Date().toISOString()

        await supabase
          .from('document_text_extractions')
          .update({
            status: 'failed',
            error_message: message.slice(0, 1000),
            updated_at: failedAt,
          })
          .eq('document_id', candidate.document_id)

        await supabase
          .from('ocr_batch_documents')
          .update({
            status: 'failed',
            semaphore: 'red',
            extraction_status: 'failed',
            canonical_status: 'not_run',
            error_message: message.slice(0, 1000),
            completed_at: failedAt,
            updated_at: failedAt,
          })
          .eq('batch_id', batch.id)
          .eq('document_id', candidate.document_id)

        responseStatus = 500
        results.push({
          documentId: candidate.document_id,
          fileName: candidate.file_name,
          status: 'failed',
          semaphore: 'red',
          error: message,
          engine: 'openai_vision_ocr',
        })
      }
    }

    const extractedCount = results.filter((item) => item.status === 'text_extracted').length
    let pipeline: Record<string, unknown> | null = null

    if (extractedCount > 0) {
      const { data: documentFacts, error: documentFactsError } = await supabase.rpc(
        'sync_subcontractor_document_facts',
      )
      if (documentFactsError) throw new Error(documentFactsError.message)

      const { data: workerFacts, error: workerFactsError } = await supabase.rpc(
        'extract_worker_facts_from_documents',
      )
      if (workerFactsError) throw new Error(workerFactsError.message)

      const { data: intelligence, error: intelligenceError } = await supabase.rpc(
        'run_compliance_intelligence_sync',
      )
      if (intelligenceError) throw new Error(intelligenceError.message)

      pipeline = { documentFacts, workerFacts, intelligence }
    }

    const failedCount = results.filter((item) => item.status === 'failed').length
    const completedAt = new Date().toISOString()
    const batchStatus = results.length === 0
      ? 'completed'
      : failedCount === results.length
        ? 'failed'
        : failedCount > 0 || responseStatus !== 200
          ? 'partial'
          : 'completed'

    await supabase
      .from('ocr_processing_batches')
      .update({
        status: batchStatus,
        processed_documents: results.length,
        successful_documents: extractedCount,
        failed_documents: failedCount,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', batch.id)

    return NextResponse.json({
      batchId: batch.id,
      batchStatus,
      processed: results.length,
      extracted: extractedCount,
      engine: 'openai_vision_ocr',
      results,
      pipeline,
      durationMs: Date.now() - startedAt,
    }, { status: responseStatus })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown OCR batch error'
    const failedAt = new Date().toISOString()
    await supabase
      .from('ocr_processing_batches')
      .update({
        status: 'failed',
        error_message: message.slice(0, 1000),
        completed_at: failedAt,
        updated_at: failedAt,
      })
      .eq('id', batch.id)

    return NextResponse.json({ batchId: batch.id, stage: 'batch', error: message }, { status: 500 })
  }
}
