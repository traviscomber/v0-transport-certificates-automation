import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300 // 5 minutes for file uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverId = formData.get('driver_id') as string
    const documentTypeId = formData.get('document_type_id') as string

    console.log('[v0] Upload request received:', { driverId, documentTypeId, fileName: file?.name })

    if (!file || !driverId || !documentTypeId) {
      console.error('[v0] Missing required fields:', { file: !!file, driverId, documentTypeId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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

    console.log('[v0] Inserting document record with minimal fields - OCR data will be added on scan')

    // Insert with minimal fields - OCR data, expiry_date, issue_date will be populated during document scanning
    const { data: docRecord, error: dbError } = await adminClient
      .from('uploaded_documents')
      .insert({
        conductor_id: driverId,
        document_type_id: documentTypeId,
        original_filename: file.name,
        file_url: publicUrlData?.publicUrl || '',
        mime_type: file.type,
        validation_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      const errorResponse = { error: 'Failed to save document', details: dbError.message }
      console.log('[v0] Returning error response:', errorResponse)
      return NextResponse.json(errorResponse, { status: 500 })
    }

    console.log('[v0] Document uploaded successfully:', docRecord)

    const successResponse = {
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente',
    }
    console.log('[v0] Returning success response:', successResponse)
    return NextResponse.json(successResponse)
  } catch (error) {
    console.error('[v0] Error in POST /api/company/documents/upload-with-metadata:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    console.error('[v0] Error message:', errorMessage)
    const errorResponse = { error: errorMessage, success: false }
    console.log('[v0] Returning error response from catch:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
