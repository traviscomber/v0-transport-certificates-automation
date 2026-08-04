import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentMetadata, extractDocumentFromText } from '@/lib/ai-document-processor'
import { extractText } from 'unpdf'
import { generateAIAnalysisAlerts } from '@/lib/document-alerts-generator'
import { parseF30Document } from '@/lib/f30-parser'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const adminClient = createAdminClient()

    console.log('[v0] Reprocessing document:', documentId)

    let doc: any = null
    let docTable = ''

    const { data: subDoc } = await adminClient
      .from('subcontractor_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (subDoc) {
      doc = subDoc
      docTable = 'subcontractor_documents'
      console.log('[v0] Found document in subcontractor_documents')
    } else {
      const { data: uploadedDoc } = await adminClient
        .from('uploaded_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (uploadedDoc) {
        doc = uploadedDoc
        docTable = 'uploaded_documents'
        console.log('[v0] Found document in uploaded_documents')
      }
    }

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!doc.file_url) {
      return NextResponse.json({ error: 'Document has no file URL' }, { status: 400 })
    }

    const fileResponse = await fetch(doc.file_url)
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch document from storage' }, { status: 500 })
    }

    const buffer = await fileResponse.arrayBuffer()
    const fileUrl = doc.file_url.toLowerCase()
    const isPdf = fileUrl.endsWith('.pdf') || fileUrl.includes('.pdf?')

    let aiExtraction: any
    let rawDocumentText = ''

    if (isPdf) {
      try {
        const pdfBuffer = new Uint8Array(buffer)
        const { text: textArray } = await extractText(pdfBuffer)
        rawDocumentText = Array.isArray(textArray) ? textArray.join('\n') : String(textArray)

        if (!rawDocumentText || rawDocumentText.trim().length < 10) {
          return NextResponse.json(
            { error: 'El PDF no contiene texto extraíble. Puede ser un PDF escaneado como imagen.' },
            { status: 400 }
          )
        }

        aiExtraction = await extractDocumentFromText(rawDocumentText, doc.document_type || 'documento')
      } catch (pdfError) {
        console.error('[v0] PDF parsing error:', pdfError)
        return NextResponse.json(
          { error: 'Error al procesar el PDF: ' + (pdfError as Error).message },
          { status: 500 }
        )
      }
    } else {
      const base64 = Buffer.from(buffer).toString('base64')
      let mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
      if (fileUrl.includes('.png')) mimeType = 'image/png'
      else if (fileUrl.includes('.gif')) mimeType = 'image/gif'
      else if (fileUrl.includes('.webp')) mimeType = 'image/webp'

      aiExtraction = await extractDocumentMetadata(base64, mimeType)
    }

    const f30Result = docTable === 'subcontractor_documents' && rawDocumentText
      ? parseF30Document({
          rawText: rawDocumentText,
          summaryText: aiExtraction.extractedText,
          expectedRut: doc.subcontractor_rut,
          documentNumber: aiExtraction.documentNumber,
          issuanceDate: aiExtraction.issuanceDate,
          confidence: aiExtraction.confidence,
          warnings: aiExtraction.warnings,
        })
      : null

    const analyzedAt = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      ai_document_type: aiExtraction.documentType,
      ai_expiration_date: aiExtraction.expirationDate || null,
      ai_issuance_date: aiExtraction.issuanceDate || null,
      ai_document_number: aiExtraction.documentNumber || null,
      ai_extracted_text: aiExtraction.extractedText || null,
      ai_confidence: aiExtraction.confidence || null,
      ai_warnings: aiExtraction.warnings || [],
      ai_analyzed_at: analyzedAt,
    }

    if (f30Result) {
      updateData.f30_status = f30Result.status
      updateData.f30_details = f30Result.details
      updateData.f30_validated_at = analyzedAt

      if (f30Result.details.periodMonth && f30Result.details.periodYear) {
        updateData.document_period_month = f30Result.details.periodMonth
        updateData.document_period_year = f30Result.details.periodYear
        updateData.document_period_start = `${f30Result.details.periodYear}-${String(f30Result.details.periodMonth).padStart(2, '0')}-01`
        updateData.document_period_source = 'metadata'
      }
    }

    const { error: updateError } = await adminClient
      .from(docTable)
      .update(updateData)
      .eq('id', documentId)

    if (updateError) {
      console.error('[v0] Error saving analysis to DB:', updateError)
    }

    const transportistaId = doc.transportista_id || doc.subcontractor_id || null
    const conductorId = doc.conductor_id || doc.driver_id || null
    const fileName = doc.file_name || doc.filename || 'documento'
    const detectedDocType = aiExtraction.documentType || doc.document_type || 'Documento'

    await generateAIAnalysisAlerts({
      documentId,
      documentTable: docTable as 'subcontractor_documents' | 'uploaded_documents',
      transportistaId,
      conductorId,
      documentType: detectedDocType,
      aiExpirationDate: aiExtraction.expirationDate,
      aiConfidence: aiExtraction.confidence || 0.5,
      fileName,
    })

    return NextResponse.json({
      success: true,
      saved: !updateError,
      documentId,
      documentTable: docTable,
      originalDocument: {
        file_name: fileName,
        document_type: doc.document_type,
        uploaded_at: doc.uploaded_at || doc.created_at,
      },
      analysis: {
        documentType: aiExtraction.documentType,
        expirationDate: aiExtraction.expirationDate,
        issuanceDate: aiExtraction.issuanceDate,
        documentNumber: aiExtraction.documentNumber,
        extractedText: aiExtraction.extractedText,
        confidence: aiExtraction.confidence,
        warnings: aiExtraction.warnings || [],
      },
      f30: f30Result,
      alertsGenerated: !!aiExtraction.expirationDate,
      message: updateError ? 'Analisis completado (no guardado)' : 'Analisis completado y guardado',
    })
  } catch (error) {
    console.error('[v0] Reprocess error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
