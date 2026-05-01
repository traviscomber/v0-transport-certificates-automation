import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { generateDocumentUploadAlerts } from '@/lib/document-alerts-generator'
import { extractDocumentMetadata } from '@/lib/ai-document-processor'
import { normalizeDocumentType, determineValidationStatus } from '@/lib/document-classification'
import { notifyExecutivas } from '@/lib/notifications-helper'

// Set max duration for the route (30 seconds - Vercel free plan limit)
export const maxDuration = 30

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { message: 'Missing file or documentType' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Get conductor info from user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get document type info
    const { data: docType, error: docTypeError } = await supabase
      .from('document_types')
      .select('*')
      .eq('code', documentType)
      .single()

    if (docTypeError || !docType) {
      return NextResponse.json(
        { message: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Generate file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `conductor-documents/${user.id}/${fileName}`

    // Upload file to storage
    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { message: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // STEP 1: Process document with AI (async, 5-10 seconds)
    console.log('[v0] Starting AI document processing for conductor upload...')
    let aiExtraction = null
    let extractionError = null
    let validationStatus = 'pending'

    try {
      // Convert file to base64 for AI processing
      const buffer = Buffer.from(fileBuffer)
      const base64 = buffer.toString('base64')
      
      // Call AI document processor
      aiExtraction = await extractDocumentMetadata(base64, file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
      console.log('[v0] AI extraction successful:', { confidence: aiExtraction.confidence })
      
      // Determine validation status based on AI extraction
      if (aiExtraction.confidence >= 0.7) {
        const daysUntilExp = aiExtraction.expirationDate 
          ? Math.floor((new Date(aiExtraction.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null
        
        validationStatus = determineValidationStatus(
          aiExtraction.confidence,
          daysUntilExp,
          !!aiExtraction.documentNumber
        ) as string
      }
    } catch (error) {
      extractionError = error instanceof Error ? error.message : 'AI extraction failed'
      console.warn('[v0] AI extraction failed (non-blocking):', extractionError)
      // Continue with document upload — AI failure doesn't block the flow
    }

    // STEP 2: Create uploaded_documents record with AI metadata
    const insertPayload: any = {
      document_type_id: docType.id,
      conductor_id: profile.id,
      uploaded_by: user.id,
      original_filename: file.name,
      file_url: publicUrl,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      validation_status: validationStatus,
      created_at: new Date().toISOString(),
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

    const { data: uploadedDoc, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert(insertPayload)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up storage
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json(
        { message: 'Failed to save document record' },
        { status: 500 }
      )
    }

    // Create notification for conductor
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Documento Subido',
        message: `Tu ${docType.name} ha sido procesado${validationStatus === 'approved' ? ' y aprobado.' : validationStatus === 'rejected' ? ' pero fue rechazado.' : ' y está en revisión.'}`,
        type: validationStatus === 'rejected' ? 'warning' : 'info',
        metadata: {
          document_id: uploadedDoc.id,
          document_type: documentType,
          validation_status: validationStatus,
          ai_confidence: aiExtraction?.confidence || 0,
        },
      })

    // STEP 3: Notify ejecutivas if document was auto-rejected by AI
    if (validationStatus === 'rejected' && aiExtraction) {
      console.log('[v0] Document auto-rejected by AI, notifying ejecutivas...')
      await notifyExecutivas({
        type: 'auto_rejection' as const,
        conductorName: profile.first_name || 'Conductor',
        documentType: docType.name,
        oldStatus: 'pending',
        newStatus: 'rejected',
        documentId: uploadedDoc.id,
        reason: `Auto-rechazado por IA: ${aiExtraction.warnings?.join(', ') || 'Documento inválido'}`,
      }).catch(err => {
        console.error('[v0] Failed to notify ejecutivas:', err)
      })
    }

    // Generate alerts for admins about the new document
    await generateDocumentUploadAlerts(
      uploadedDoc.id,
      docType.name,
      profile.first_name || 'Conductor',
      'conductor',
      user.id
    )

    return NextResponse.json(
      {
        success: true,
        documentId: uploadedDoc.id,
        validationStatus,
        aiExtraction: aiExtraction ? {
          confidence: aiExtraction.confidence,
          documentType: aiExtraction.documentType,
          expirationDate: aiExtraction.expirationDate,
        } : null,
        message: `Documento subido ${validationStatus === 'approved' ? 'y aprobado automáticamente' : validationStatus === 'rejected' ? 'pero fue rechazado por IA' : 'y está en revisión'}`,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
