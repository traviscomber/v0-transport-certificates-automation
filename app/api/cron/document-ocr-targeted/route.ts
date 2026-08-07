import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentLocally } from '@/lib/local-ocr'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

const MAX_FILE_BYTES = 12 * 1024 * 1024

type Semaphore = 'processing' | 'green' | 'yellow' | 'red'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

function inferMimeType(fileName: string | null, contentType: string | null): string {
  const normalized = String(fileName ?? '').toLowerCase()
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'
  if (normalized.endsWith('.webp')) return 'image/webp'
  if (contentType?.startsWith('image/')) return contentType
  throw new Error('OCR_UNSUPPORTED_FORMAT: only JPG, JPEG, PNG and WEBP are enabled')
}

function isVehicleRelated(fileName: string | null, documentType: string | null): boolean {
  return /patente|placa|matr[ií]cula|cam[ií]on|veh[ií]culo|padr[oó]n|revisi[oó]n\s*t[eé]cnica/i
    .test(`${fileName ?? ''} ${documentType ?? ''}`)
}

function expectedType(fileName: string | null, documentType: string | null): string {
  const source = `${fileName ?? ''} ${documentType ?? ''}`
  if (/patente|placa|matr[ií]cula|cam[ií]on|veh[ií]culo/i.test(source)) return 'PATENTE_VEHICULO'
  if (/padr[oó]n/i.test(source)) return 'PADRON_VEHICULO'
  if (/revisi[oó]n\s*t[eé]cnica/i.test(source)) return 'REVISION_TECNICA_VEHICULO'
  return documentType || 'DOCUMENTO'
}

function semaphoreFor(status: string): Semaphore {
  if (status === 'matched' || status === 'not_vehicle_related') return 'green'
  if (status === 'owner_conflict' || status === 'failed') return 'red'
  return 'yellow'
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const documentId = request.nextUrl.searchParams.get('documentId')
  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: document, error: documentQueryError } = await supabase
    .from('subcontractor_documents')
    .select('id, file_name, file_url, document_type_id, is_current')
    .eq('id', documentId)
    .eq('is_current', true)
    .maybeSingle()

  if (documentQueryError) {
    return NextResponse.json({ stage: 'document_query', error: documentQueryError.message }, { status: 500 })
  }
  if (!document) {
    return NextResponse.json({ error: 'Current document not found' }, { status: 404 })
  }

  const { data: documentTypeRow, error: documentTypeError } = await supabase
    .from('subcontractor_document_types')
    .select('code, nombre')
    .eq('id', document.document_type_id)
    .maybeSingle()

  if (documentTypeError) {
    return NextResponse.json({ stage: 'document_type_query', error: documentTypeError.message }, { status: 500 })
  }

  const documentType = [documentTypeRow?.code, documentTypeRow?.nombre].filter(Boolean).join(' ') || 'DOCUMENTO'

  const { data: extractionState, error: extractionQueryError } = await supabase
    .from('document_text_extractions')
    .select('attempts, status')
    .eq('document_id', documentId)
    .maybeSingle()

  if (extractionQueryError) {
    return NextResponse.json({ stage: 'extraction_query', error: extractionQueryError.message }, { status: 500 })
  }

  const { data: batch, error: batchError } = await supabase
    .from('ocr_processing_batches')
    .insert({
      source: 'document_ocr_targeted',
      status: 'processing',
      total_documents: 1,
      metadata: {
        documentId,
        deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      },
    })
    .select('id')
    .single()

  if (batchError) {
    return NextResponse.json({ stage: 'batch_create', error: batchError.message }, { status: 500 })
  }

  await supabase.from('ocr_batch_documents').insert({
    batch_id: batch.id,
    document_id: documentId,
    status: 'processing',
    semaphore: 'processing',
    extraction_status: 'processing',
    metadata: { fileName: document.file_name, documentType },
  })

  try {
    const attempts = Number(extractionState?.attempts ?? 0) + 1
    const { error: lockError } = await supabase
      .from('document_text_extractions')
      .update({ status: 'processing', attempts, error_message: null, updated_at: now })
      .eq('document_id', documentId)

    if (lockError) throw new Error(lockError.message)

    const fileResponse = await fetch(document.file_url, { cache: 'no-store', redirect: 'follow' })
    if (!fileResponse.ok) throw new Error(`Document download failed with HTTP ${fileResponse.status}`)

    const contentLength = Number(fileResponse.headers.get('content-length') ?? 0)
    if (contentLength > MAX_FILE_BYTES) throw new Error(`Document exceeds OCR size limit (${contentLength} bytes)`)

    const buffer = await fileResponse.arrayBuffer()
    if (!buffer.byteLength) throw new Error('Document is empty')
    if (buffer.byteLength > MAX_FILE_BYTES) throw new Error(`Document exceeds OCR size limit (${buffer.byteLength} bytes)`)

    const mimeType = inferMimeType(document.file_name, fileResponse.headers.get('content-type'))
    const targetType = expectedType(document.file_name, documentType)
    const extraction = await extractDocumentLocally(new Uint8Array(buffer), targetType, mimeType)
    const extractedText = extraction.extractedText.trim()
    const analyzedAt = new Date().toISOString()
    const engine = 'openai_vision_ocr'

    const { error: documentUpdateError } = await supabase
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
      .eq('id', documentId)

    if (documentUpdateError) throw new Error(documentUpdateError.message)

    const { error: extractionUpdateError } = await supabase
      .from('document_text_extractions')
      .update({
        status: 'text_extracted',
        extraction_method: engine,
        text_length: extractedText.length,
        error_message: null,
        processed_at: analyzedAt,
        updated_at: analyzedAt,
      })
      .eq('document_id', documentId)

    if (extractionUpdateError) throw new Error(extractionUpdateError.message)

    let canonicalStatus = 'not_vehicle_related'
    let candidateCount = 0
    let matchedCount = 0
    const vehicleRelated = isVehicleRelated(document.file_name, documentType)

    if (vehicleRelated) {
      const { error: canonicalError } = await supabase.rpc('canonicalize_vehicle_document', {
        p_document_id: documentId,
      })
      if (canonicalError) throw new Error(`Canonicalization failed: ${canonicalError.message}`)

      const { data: scan, error: scanError } = await supabase
        .from('vehicle_document_scans')
        .select('status, candidate_count, matched_count, error_message')
        .eq('document_id', documentId)
        .maybeSingle()

      if (scanError) throw new Error(scanError.message)
      if (!scan) throw new Error('Canonicalization did not persist vehicle_document_scans')

      canonicalStatus = String(scan.status)
      candidateCount = Number(scan.candidate_count ?? 0)
      matchedCount = Number(scan.matched_count ?? 0)
    }

    const semaphore = semaphoreFor(canonicalStatus)
    const completedAt = new Date().toISOString()

    const { error: batchDocumentError } = await supabase
      .from('ocr_batch_documents')
      .update({
        status: 'canonicalized',
        semaphore,
        extraction_status: 'text_extracted',
        canonical_status: canonicalStatus,
        completed_at: completedAt,
        updated_at: completedAt,
        metadata: {
          fileName: document.file_name,
          documentType: targetType,
          textLength: extractedText.length,
          confidence: extraction.confidence,
          engine,
          vehicleRelated,
        },
      })
      .eq('batch_id', batch.id)
      .eq('document_id', documentId)

    if (batchDocumentError) throw new Error(batchDocumentError.message)

    const { data: documentFacts, error: factsError } = await supabase.rpc('sync_subcontractor_document_facts')
    if (factsError) throw new Error(factsError.message)

    await supabase
      .from('ocr_processing_batches')
      .update({
        status: 'completed',
        processed_documents: 1,
        successful_documents: 1,
        failed_documents: 0,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', batch.id)

    return NextResponse.json({
      batchId: batch.id,
      batchStatus: 'completed',
      documentId,
      fileName: document.file_name,
      status: 'text_extracted',
      canonicalStatus,
      semaphore,
      vehicleRelated,
      candidateCount,
      matchedCount,
      textLength: extractedText.length,
      confidence: extraction.confidence,
      documentFacts,
      durationMs: Date.now() - startedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown targeted OCR error'
    const failedAt = new Date().toISOString()

    await supabase
      .from('document_text_extractions')
      .update({
        status: 'ocr_required',
        text_length: 0,
        error_message: message.slice(0, 1000),
        processed_at: null,
        updated_at: failedAt,
      })
      .eq('document_id', documentId)

    await supabase
      .from('ocr_batch_documents')
      .update({
        status: 'queued_retry',
        semaphore: 'yellow',
        extraction_status: 'ocr_required',
        canonical_status: 'not_run',
        error_message: message.slice(0, 1000),
        completed_at: failedAt,
        updated_at: failedAt,
      })
      .eq('batch_id', batch.id)
      .eq('document_id', documentId)

    await supabase
      .from('ocr_processing_batches')
      .update({
        status: 'failed',
        processed_documents: 1,
        successful_documents: 0,
        failed_documents: 1,
        error_message: message.slice(0, 1000),
        completed_at: failedAt,
        updated_at: failedAt,
      })
      .eq('id', batch.id)

    return NextResponse.json({ batchId: batch.id, documentId, error: message }, { status: 500 })
  }
}
