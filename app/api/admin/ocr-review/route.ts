import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ReviewAction = 'approve' | 'correct' | 'retry' | 'reject'

function isVehicleRelated(fileName: string | null, documentType: string | null): boolean {
  return /patente|placa|matr[ií]cula|cam[ií]on|veh[ií]culo|padr[oó]n|revisi[oó]n\s*t[eé]cnica/i
    .test(`${fileName ?? ''} ${documentType ?? ''}`)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    documentId?: string
    action?: ReviewAction
    correctedText?: string
    notes?: string
  }

  const documentId = String(body.documentId ?? '').trim()
  const action = body.action
  const correctedText = String(body.correctedText ?? '').trim()
  const notes = String(body.notes ?? '').trim()

  if (!documentId || !action || !['approve', 'correct', 'retry', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'documentId and a valid action are required' }, { status: 400 })
  }
  if (action === 'correct' && !correctedText) {
    return NextResponse.json({ error: 'correctedText is required for correction' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: document, error: documentError } = await supabase
    .from('subcontractor_documents')
    .select('id, file_name, document_type_id, ai_extracted_text, ai_warnings')
    .eq('id', documentId)
    .eq('is_current', true)
    .maybeSingle()

  if (documentError) return NextResponse.json({ error: documentError.message }, { status: 500 })
  if (!document) return NextResponse.json({ error: 'Current document not found' }, { status: 404 })

  const [{ data: extraction, error: extractionError }, { data: documentType }] = await Promise.all([
    supabase
      .from('document_text_extractions')
      .select('status, attempts')
      .eq('document_id', documentId)
      .maybeSingle(),
    document.document_type_id
      ? supabase.from('document_types').select('code').eq('id', document.document_type_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (extractionError) return NextResponse.json({ error: extractionError.message }, { status: 500 })

  const now = new Date().toISOString()
  const originalText = String(document.ai_extracted_text ?? '')
  const originalStatus = String(extraction?.status ?? 'pending')

  const { error: auditError } = await supabase.from('ocr_manual_reviews').insert({
    document_id: documentId,
    action,
    original_status: originalStatus,
    original_text: originalText || null,
    corrected_text: action === 'correct' ? correctedText : null,
    notes: notes || null,
  })
  if (auditError) return NextResponse.json({ error: auditError.message }, { status: 500 })

  if (action === 'retry') {
    const { error } = await supabase.from('document_text_extractions').upsert({
      document_id: documentId,
      status: 'ocr_required',
      attempts: 0,
      text_length: 0,
      error_message: null,
      processed_at: null,
      updated_at: now,
    }, { onConflict: 'document_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, documentId, action, status: 'ocr_required' })
  }

  if (action === 'reject') {
    const { error } = await supabase.from('document_text_extractions').upsert({
      document_id: documentId,
      status: 'failed',
      error_message: 'Manual OCR review rejected. This does not invalidate base compliance.',
      processed_at: null,
      updated_at: now,
    }, { onConflict: 'document_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, documentId, action, status: 'failed' })
  }

  const finalText = action === 'correct' ? correctedText : originalText.trim()
  if (!finalText) {
    return NextResponse.json({ error: 'There is no extracted text to approve' }, { status: 409 })
  }

  if (action === 'correct') {
    const warnings = Array.isArray(document.ai_warnings) ? document.ai_warnings.map(String) : []
    const { error } = await supabase
      .from('subcontractor_documents')
      .update({
        ai_extracted_text: finalText,
        ai_warnings: Array.from(new Set([...warnings, 'manual_ocr_correction'])),
        ai_analyzed_at: now,
      })
      .eq('id', documentId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { error: extractionUpdateError } = await supabase.from('document_text_extractions').upsert({
    document_id: documentId,
    status: 'text_extracted',
    extraction_method: action === 'correct' ? 'manual_review' : 'manual_approval',
    text_length: finalText.length,
    error_message: null,
    processed_at: now,
    updated_at: now,
  }, { onConflict: 'document_id' })
  if (extractionUpdateError) return NextResponse.json({ error: extractionUpdateError.message }, { status: 500 })

  const vehicleRelated = isVehicleRelated(document.file_name, documentType?.code ?? null)
  if (vehicleRelated) {
    const { error } = await supabase.rpc('canonicalize_vehicle_document', { p_document_id: documentId })
    if (error) return NextResponse.json({ error: `Saved review, canonicalization failed: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    documentId,
    action,
    status: 'text_extracted',
    vehicleRelated,
  })
}
