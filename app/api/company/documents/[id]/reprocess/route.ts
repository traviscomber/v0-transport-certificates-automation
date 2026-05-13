import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentMetadata, extractDocumentFromText } from '@/lib/ai-document-processor'
import { normalizeDocumentType, determineValidationStatus } from '@/lib/document-classification'
import { extractText } from 'unpdf'
import { generateAIAnalysisAlerts } from '@/lib/document-alerts-generator'

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

/**
 * Endpoint to manually reprocess a document with AI
 * Useful for documents that failed extraction or need re-evaluation
 * 
 * POST /api/company/documents/[id]/reprocess
 * Body: { documentId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const adminClient = createAdminClient()

    console.log('[v0] Reprocessing document:', documentId)

    // Try to find document in subcontractor_documents first (most common for pending)
    let doc: any = null
    let docTable = ''
    
    const { data: subDoc, error: subError } = await adminClient
      .from('subcontractor_documents')
      .select('*')
      .eq('id', documentId)
      .single()
    
    if (subDoc) {
      doc = subDoc
      docTable = 'subcontractor_documents'
      console.log('[v0] Found document in subcontractor_documents')
    } else {
      // Try uploaded_documents (conductor documents)
      const { data: uploadedDoc, error: uploadedError } = await adminClient
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
      console.log('[v0] Document not found in any table:', documentId)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (!doc.file_url) {
      return NextResponse.json(
        { error: 'Document has no file URL' },
        { status: 400 }
      )
    }

    console.log('[v0] Fetching document from storage:', doc.file_url)

    // Download document from storage
    const fileResponse = await fetch(doc.file_url)
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch document from storage' },
        { status: 500 }
      )
    }

    const buffer = await fileResponse.arrayBuffer()
    const fileUrl = doc.file_url.toLowerCase()
    const isPdf = fileUrl.endsWith('.pdf') || fileUrl.includes('.pdf?')
    
    let aiExtraction: any
    
    if (isPdf) {
      // Extract text from PDF using pdf-parse
      console.log('[v0] Extracting text from PDF...')
      try {
        const pdfBuffer = new Uint8Array(buffer)
        const { text: textArray } = await extractText(pdfBuffer)
        
        // unpdf returns an array of strings (one per page), join them
        const pdfText = Array.isArray(textArray) ? textArray.join('\n') : String(textArray)
        
        if (!pdfText || pdfText.trim().length < 10) {
          return NextResponse.json(
            { error: 'El PDF no contiene texto extraíble. Puede ser un PDF escaneado como imagen.' },
            { status: 400 }
          )
        }
        
        console.log('[v0] PDF text extracted, length:', pdfText.length)
        console.log('[v0] First 500 chars:', pdfText.substring(0, 500))
        
        // Analyze extracted text with GPT
        aiExtraction = await extractDocumentFromText(pdfText, doc.document_type || 'documento')
        console.log('[v0] PDF text analysis complete')
      } catch (pdfError) {
        console.error('[v0] PDF parsing error:', pdfError)
        return NextResponse.json(
          { error: 'Error al procesar el PDF: ' + (pdfError as Error).message },
          { status: 500 }
        )
      }
    } else {
      // Regular image file - use vision API
      const base64 = Buffer.from(buffer).toString('base64')
      
      // Detect MIME type from URL
      let mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
      if (fileUrl.includes('.png')) mimeType = 'image/png'
      else if (fileUrl.includes('.gif')) mimeType = 'image/gif'
      else if (fileUrl.includes('.webp')) mimeType = 'image/webp'
      
      console.log('[v0] Starting image analysis with mimeType:', mimeType)
      aiExtraction = await extractDocumentMetadata(base64, mimeType)
    }

    console.log('[v0] Analysis successful:', aiExtraction)

    // Save the analysis results to the database
    const updateData = {
      ai_document_type: aiExtraction.documentType,
      ai_expiration_date: aiExtraction.expirationDate || null,
      ai_issuance_date: aiExtraction.issuanceDate || null,
      ai_document_number: aiExtraction.documentNumber || null,
      ai_extracted_text: aiExtraction.extractedText || null,
      ai_confidence: aiExtraction.confidence || null,
      ai_warnings: aiExtraction.warnings || [],
      ai_analyzed_at: new Date().toISOString(),
    }

    const { error: updateError } = await adminClient
      .from(docTable)
      .update(updateData)
      .eq('id', documentId)

    if (updateError) {
      console.error('[v0] Error saving analysis to DB:', updateError)
    } else {
      console.log('[v0] Analysis results saved to database')
    }

    // Generate alerts based on analysis results (especially expiration dates)
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

    // Return the analysis results to show in the modal
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
      alertsGenerated: !!aiExtraction.expirationDate,
      message: updateError 
        ? 'Analisis completado (no guardado)' 
        : aiExtraction.expirationDate 
          ? 'Analisis completado, guardado y alertas generadas' 
          : 'Analisis completado y guardado',
    })
  } catch (error) {
    console.error('[v0] Reprocess error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
