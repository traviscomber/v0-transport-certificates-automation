import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300 // 5 minutes for file uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverId = formData.get('driver_id') as string
    const documentTypeId = formData.get('document_type_id') as string
    const metadataStr = formData.get('metadata') as string

    console.log('[v0] Upload request received:', { driverId, documentTypeId, fileName: file?.name })

    if (!file || !driverId || !documentTypeId) {
      console.error('[v0] Missing required fields:', { file: !!file, driverId, documentTypeId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let metadata = {}
    try {
      metadata = JSON.parse(metadataStr || '{}')
    } catch (parseErr) {
      console.warn('[v0] Failed to parse metadata, using empty object:', parseErr)
      metadata = {}
    }

    const adminClient = createAdminClient()

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`
    const storagePath = `drivers/${driverId}/${fileName}`

    console.log('[v0] Uploading to storage:', { storagePath })

    const arrayBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(storagePath)

    console.log('[v0] Inserting document record to database in uploaded_documents table')

    // Create document record in database - use uploaded_documents table
    const { data: docRecord, error: dbError } = await adminClient
      .from('uploaded_documents')
      .insert({
        conductor_id: driverId,
        document_type_id: documentTypeId,
        original_filename: file.name,
        file_url: publicUrlData?.publicUrl || '',
        file_size: file.size,
        mime_type: file.type,
        validation_status: 'pending',
        ocr_structured_data: {
          document_type_id: documentTypeId,
          expiry_date: metadata.expiry_date || null,
          issue_date: metadata.issue_date || null,
          ...metadata
        },
        expiry_date: metadata.expiry_date ? new Date(metadata.expiry_date as string).toISOString().split('T')[0] : null,
        issue_date: metadata.issue_date ? new Date(metadata.issue_date as string).toISOString().split('T')[0] : null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save document', details: dbError.message }, { status: 500 })
    }

    console.log('[v0] Document uploaded successfully:', {
      documentId: docRecord.id,
      driverId,
      fileName,
    })

    const responseData = {
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente',
    }

    console.log('[v0] Returning response:', responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[v0] Error in POST /api/company/documents/upload-with-metadata:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    console.error('[v0] Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    )
  }
}
