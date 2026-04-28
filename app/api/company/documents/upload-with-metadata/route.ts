import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300 // 5 minutes for file uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverId = formData.get('driver_id') as string
    const documentTypeId = formData.get('document_type_id') as string
    const uploadedBy = formData.get('uploaded_by') as string

    if (!file || !driverId || !documentTypeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`
    const storagePath = `drivers/${driverId}/${fileName}`

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

    // Direct table insert with only core fields - this bypasses schema cache issues
    const { data: docRecord, error: dbError } = await adminClient
      .from('uploaded_documents')
      .insert([{
        conductor_id: driverId,
        document_type_id: documentTypeId,
        original_filename: file.name,
        validation_status: 'pending'
      }])
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save document', details: dbError.message }, { status: 500 })
    }

    // Update with uploaded_by if provided (separate call to avoid schema cache issues)
    if (uploadedBy && docRecord?.id) {
      const { error: updateError } = await adminClient
        .from('uploaded_documents')
        .update({ uploaded_by: uploadedBy })
        .eq('id', docRecord.id)
      
      if (updateError) {
        console.warn('[v0] Could not update uploaded_by field:', updateError)
        // Don't fail the upload if we can't set the uploader name - the document is already saved
      }
    }

    return NextResponse.json({
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error in upload:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 })
  }
}
