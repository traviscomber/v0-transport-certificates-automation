import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentFromPdfBuffer } from '@/lib/ai-document-processor'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_DOCUMENTS_PER_RUN = 3

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /429|rate.?limit|quota|insufficient_quota/i.test(message)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()
  const results: Array<Record<string, unknown>> = []

  for (let index = 0; index < MAX_DOCUMENTS_PER_RUN; index += 1) {
    const { data: candidate, error: candidateError } = await supabase
      .from('ocr_priority_queue')
      .select('document_id, document_type, file_name, file_url, attempts, priority_score')
      .order('priority_score', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (candidateError) {
      return NextResponse.json({ error: candidateError.message }, { status: 500 })
    }
    if (!candidate) break

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

    if (lockError) {
      results.push({ documentId: candidate.document_id, status: 'lock_error', error: lockError.message })
      continue
    }
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

      const extraction = await extractDocumentFromPdfBuffer(
        new Uint8Array(buffer),
        candidate.document_type || 'documento',
      )
      const extractedText = extraction.extractedText.trim()
      if (extractedText.length < 10) throw new Error('OCR returned insufficient text')

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
          extraction_method: 'openai_ocr',
          text_length: extractedText.length,
          error_message: null,
          processed_at: analyzedAt,
          updated_at: analyzedAt,
        })
        .eq('document_id', candidate.document_id)

      if (extractionError) throw new Error(extractionError.message)

      results.push({
        documentId: candidate.document_id,
        fileName: candidate.file_name,
        status: 'text_extracted',
        textLength: extractedText.length,
        confidence: extraction.confidence,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OCR error'
      const rateLimited = isRateLimitError(error)
      await supabase
        .from('document_text_extractions')
        .update({
          status: rateLimited ? 'ocr_required' : 'failed',
          error_message: message.slice(0, 1000),
          updated_at: new Date().toISOString(),
        })
        .eq('document_id', candidate.document_id)

      results.push({
        documentId: candidate.document_id,
        fileName: candidate.file_name,
        status: rateLimited ? 'paused_rate_limit' : 'failed',
        error: message,
      })

      if (rateLimited) break
    }
  }

  const extractedCount = results.filter((item) => item.status === 'text_extracted').length
  let pipeline: Record<string, unknown> | null = null

  if (extractedCount > 0) {
    const { data: documentFacts, error: documentFactsError } = await supabase.rpc(
      'sync_subcontractor_document_facts',
    )
    if (documentFactsError) {
      return NextResponse.json({
        stage: 'document_facts',
        processed: results.length,
        results,
        error: documentFactsError.message,
        durationMs: Date.now() - startedAt,
      }, { status: 500 })
    }

    const { data: workerFacts, error: workerFactsError } = await supabase.rpc(
      'extract_worker_facts_from_documents',
    )
    if (workerFactsError) {
      return NextResponse.json({
        stage: 'worker_facts',
        processed: results.length,
        results,
        documentFacts,
        error: workerFactsError.message,
        durationMs: Date.now() - startedAt,
      }, { status: 500 })
    }

    const { data: intelligence, error: intelligenceError } = await supabase.rpc(
      'run_compliance_intelligence_sync',
    )
    if (intelligenceError) {
      return NextResponse.json({
        stage: 'compliance_intelligence',
        processed: results.length,
        results,
        documentFacts,
        workerFacts,
        error: intelligenceError.message,
        durationMs: Date.now() - startedAt,
      }, { status: 500 })
    }

    pipeline = { documentFacts, workerFacts, intelligence }
  }

  return NextResponse.json({
    processed: results.length,
    extracted: extractedCount,
    results,
    pipeline,
    durationMs: Date.now() - startedAt,
  })
}
