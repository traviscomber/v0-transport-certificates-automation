import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentMetadata } from '@/lib/ai-document-processor'
import { normalizeDocumentType, determineValidationStatus } from '@/lib/document-classification'

export const maxDuration = 300 // 5 minutes

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

    // Check if file is a PDF - GPT-4o-mini cannot process PDFs directly
    const fileUrl = doc.file_url.toLowerCase()
    const isPdf = fileUrl.endsWith('.pdf') || fileUrl.includes('.pdf?')
    
    if (isPdf) {
      console.log('[v0] Document is a PDF - cannot analyze directly')
      return NextResponse.json(
        { 
          error: 'Los archivos PDF no pueden ser analizados directamente. Por favor, suba una imagen (JPG, PNG) del documento para usar el análisis con IA.',
          isPdf: true,
          suggestion: 'Tome una foto o captura de pantalla del documento y súbala como imagen.'
        },
        { status: 400 }
      )
    }

    // Download document from storage
    const fileResponse = await fetch(doc.file_url)
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch document from storage' },
        { status: 500 }
      )
    }

    const buffer = await fileResponse.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Detect MIME type from URL
    let mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
    if (fileUrl.includes('.png')) mimeType = 'image/png'
    else if (fileUrl.includes('.gif')) mimeType = 'image/gif'
    else if (fileUrl.includes('.webp')) mimeType = 'image/webp'

    // Re-extract metadata
    console.log('[v0] Starting re-extraction with mimeType:', mimeType)
    const aiExtraction = await extractDocumentMetadata(base64, mimeType)

    console.log('[v0] Re-extraction successful:', aiExtraction)

    // Determine new validation status
    const daysUntilExp = aiExtraction.expirationDate
      ? Math.floor(
          (new Date(aiExtraction.expirationDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

    const newValidationStatus = determineValidationStatus(
      aiExtraction.confidence,
      daysUntilExp,
      !!aiExtraction.documentNumber
    )

    // Update document with new extraction data based on which table it came from
    const updateData = docTable === 'subcontractor_documents' 
      ? {
          // subcontractor_documents schema
          ai_extracted_type: normalizeDocumentType(aiExtraction.documentType),
          ai_extracted_expiry: aiExtraction.expirationDate,
          ai_confidence: aiExtraction.confidence,
          ai_warnings: aiExtraction.warnings || [],
          ai_processed: true,
        }
      : {
          // uploaded_documents schema
          extracted_document_type: normalizeDocumentType(aiExtraction.documentType),
          extracted_expiration_date: aiExtraction.expirationDate,
          extraction_confidence: aiExtraction.confidence,
          extraction_warnings: aiExtraction.warnings || [],
          ai_processing_status: 'completed',
          validation_status: newValidationStatus,
        }

    const { data: updated, error: updateError } = await adminClient
      .from(docTable)
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update document', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: updated,
      aiExtraction,
      newValidationStatus,
      message: 'Document reprocessed successfully',
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
