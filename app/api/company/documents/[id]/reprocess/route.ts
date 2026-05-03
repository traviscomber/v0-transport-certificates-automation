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

    // Fetch document and its storage URL
    const { data: doc, error: fetchError } = await adminClient
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
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
    const base64 = Buffer.from(buffer).toString('base64')

    // Re-extract metadata
    console.log('[v0] Starting re-extraction...')
    const aiExtraction = await extractDocumentMetadata(
      base64,
      'image/jpeg' // Assume JPEG, could detect from doc.file_url
    )

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

    // Update document with new extraction data
    const { data: updated, error: updateError } = await adminClient
      .from('uploaded_documents')
      .update({
        extracted_document_type: normalizeDocumentType(aiExtraction.documentType),
        extracted_expiration_date: aiExtraction.expirationDate,
        extraction_confidence: aiExtraction.confidence,
        extraction_warnings: aiExtraction.warnings || [],
        ai_processing_status: 'completed',
        validation_status: newValidationStatus,
      })
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
