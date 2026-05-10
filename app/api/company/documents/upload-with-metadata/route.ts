import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractDocumentMetadata } from '@/lib/ai-document-processor'
import { normalizeDocumentType, determineValidationStatus } from '@/lib/document-classification'
import { verifyAuth } from '@/lib/auth-middleware'

export const maxDuration = 300 // 5 minutes for file uploads

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Upload endpoint: START')

    // Verify authentication first
    console.log('[v0] Upload endpoint: Verifying authentication')
    const { user, error: authError } = await verifyAuth(request)

    if (authError || !user) {
      console.log('[v0] Upload endpoint: Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Upload endpoint: Authenticated user:', { id: user.id, email: user.email })

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error parsing JSON'
      console.error('[v0] Upload endpoint: Failed to parse JSON:', errorMessage)
      return NextResponse.json(
        { error: 'Failed to parse request body: ' + errorMessage },
        { status: 400 }
      )
    }

    const { file: fileBase64, fileName, fileType, driver_rut: driverRut, document_type_id: documentTypeId, uploaded_by: uploadedBy, metadata } = body

    console.log('[v0] Upload endpoint: Request data received:', {
      fileName,
      fileType,
      driverRut,
      documentTypeId,
      uploadedBy,
      hasFile: !!fileBase64,
      fileSize: fileBase64?.length || 0
    })

    if (!fileBase64 || !driverRut || !documentTypeId || !fileName) {
      console.log('[v0] Upload endpoint: Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Resolve real conductor UUID from conductores table by RUT
    const { data: conductorRow, error: conductorError } = await adminClient
      .from('conductores')
      .select('id')
      .eq('rut', driverRut)
      .single()

    console.log('[v0] Upload endpoint: Conductor lookup:', {
      rut: driverRut,
      found: !!conductorRow?.id,
      error: conductorError?.message
    })

    if (conductorError || !conductorRow?.id) {
      console.log('[v0] Upload endpoint: Conductor not found')
      return NextResponse.json({ error: 'Conductor no encontrado en la base de datos', details: `RUT ${driverRut} not found` }, { status: 400 })
    }

    const conductorUUID = conductorRow.id

    const storagePath = `drivers/${conductorUUID}/${Date.now()}_${fileName}`

    console.log('[v0] Upload endpoint: Uploading to storage:', storagePath)

    // Convert Base64 to Buffer
    const buffer = Buffer.from(fileBase64, 'base64')
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: true,
      })

    if (uploadError) {
      console.error('[v0] Upload endpoint: Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })
    }

    console.log('[v0] Upload endpoint: File uploaded to storage successfully')

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // STEP 2: Extract document metadata using AI (async, 5-10 seconds)
    console.log('[v0] Upload endpoint: Starting AI document processing...')
    let aiExtraction = null
    let extractionError = null

    try {
      // Call AI document processor with Base64
      aiExtraction = await extractDocumentMetadata(fileBase64, fileType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
      console.log('[v0] Upload endpoint: AI extraction successful:', aiExtraction)
    } catch (error) {
      extractionError = error instanceof Error ? error.message : 'AI extraction failed'
      console.warn('[v0] Upload endpoint: AI extraction failed (non-blocking):', extractionError)
      // Continue with document upload — AI failure doesn't block the flow
    }

    // STEP 3: Determine validation status based on AI extraction
    let validationStatus: string = 'pending'
    let aiConfidence = 0

    if (aiExtraction && aiExtraction.confidence >= 0.7) {
      aiConfidence = aiExtraction.confidence
      const daysUntilExp = aiExtraction.expirationDate 
        ? Math.floor((new Date(aiExtraction.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null
      
      validationStatus = determineValidationStatus(
        aiExtraction.confidence,
        daysUntilExp,
        !!aiExtraction.documentNumber
      ) as string
    }

    // Insert using only columns that exist in the uploaded_documents table
    const insertPayload: any = {
      conductor_id: conductorUUID,
      document_type_id: documentTypeId,
      original_filename: fileName,
      file_url: publicUrlData?.publicUrl || '',
      validation_status: validationStatus
    }

    // Add AI-extracted fields if extraction was successful
    if (aiExtraction) {
      insertPayload.extracted_document_type = normalizeDocumentType(aiExtraction.documentType)
      insertPayload.extracted_expiration_date = aiExtraction.expirationDate
      insertPayload.extraction_confidence = aiExtraction.confidence
      insertPayload.extraction_warnings = aiExtraction.warnings || []
      insertPayload.ai_processing_status = 'completed'
    } else {
      insertPayload.ai_processing_status = 'failed'
      if (extractionError) {
        insertPayload.extraction_warnings = [extractionError]
      }
    }

    console.log('[v0] Upload endpoint: Inserting document record')

    const { data: docRecord, error: dbError } = await adminClient
      .from('uploaded_documents')
      .insert([insertPayload])
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Upload endpoint: Database insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save document', details: dbError.message }, { status: 500 })
    }

    console.log('[v0] Upload endpoint: ✅ Document uploaded successfully:', { id: docRecord.id })

    // Send notification to ejecutivas if document was auto-rejected by AI
    if (validationStatus === 'rejected' && aiExtraction) {
      console.log('[v0] Upload endpoint: Document auto-rejected by AI, would trigger notification here')
      // In production: call notifyExecutivas with auto-rejection reason
    }

    return NextResponse.json({
      success: true,
      document: docRecord,
      aiExtraction: aiExtraction || null,
      validationStatus,
      message: 'Documento subido y procesado con IA'
    })
  } catch (error) {
    console.error('[v0] Upload endpoint: ERROR:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 })
  }
}
