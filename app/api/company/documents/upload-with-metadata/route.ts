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

    let metadata: any = {}
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

    console.log('[v0] Inserting document record to database using raw SQL')

    // Use raw SQL to bypass schema cache issues
    const expiryDate = metadata.expiry_date ? new Date(metadata.expiry_date).toISOString().split('T')[0] : null
    const issueDate = metadata.issue_date ? new Date(metadata.issue_date).toISOString().split('T')[0] : null

    const { data: docRecord, error: dbError } = await adminClient.rpc('execute_sql', {
      sql: `
        INSERT INTO public.uploaded_documents (
          conductor_id, 
          document_type_id, 
          original_filename, 
          file_url, 
          file_path,
          file_size, 
          mime_type, 
          validation_status, 
          ocr_structured_data,
          expiry_date,
          issue_date
        ) VALUES (
          $1::uuid, 
          $2::uuid, 
          $3, 
          $4, 
          $5,
          $6::integer,
          $7,
          'pending',
          $8::jsonb,
          $9::date,
          $10::date
        ) RETURNING id, conductor_id, document_type_id, original_filename, file_url, created_at
      `,
      params: [
        driverId,
        documentTypeId,
        file.name,
        publicUrlData?.publicUrl || '',
        storagePath,
        file.size,
        file.type,
        JSON.stringify({
          document_type_id: documentTypeId,
          expiry_date: metadata.expiry_date || null,
          issue_date: metadata.issue_date || null,
          ...metadata
        }),
        expiryDate,
        issueDate
      ]
    })

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      // Fallback: try simple insert with minimal fields
      console.log('[v0] RPC failed, trying direct table insert with minimal fields')
      const { data: fallbackDoc, error: fallbackError } = await adminClient
        .from('uploaded_documents')
        .insert({
          conductor_id: driverId,
          document_type_id: documentTypeId,
          original_filename: file.name,
          file_url: publicUrlData?.publicUrl || '',
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          validation_status: 'pending',
          ocr_structured_data: {
            document_type_id: documentTypeId,
            expiry_date: metadata.expiry_date || null,
            issue_date: metadata.issue_date || null,
            ...metadata
          },
          expiry_date: expiryDate ? new Date(expiryDate) : undefined,
          issue_date: issueDate ? new Date(issueDate) : undefined
        })
        .select()
        .single()

      if (fallbackError) {
        console.error('[v0] Fallback insert failed:', fallbackError)
        return NextResponse.json({ error: 'Failed to save document', details: fallbackError.message }, { status: 500 })
      }

      console.log('[v0] Fallback insert successful')
      return NextResponse.json({
        success: true,
        document: fallbackDoc,
        message: 'Documento subido exitosamente (fallback)',
      })
    }

    console.log('[v0] Document uploaded successfully:', docRecord)

    return NextResponse.json({
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente',
    })
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

    let metadata: any = {}
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

    // Use raw SQL to bypass TypeScript schema cache issues
    const { data: docRecord, error: dbError } = await adminClient.rpc('insert_uploaded_document', {
      p_conductor_id: driverId,
      p_document_type_id: documentTypeId,
      p_original_filename: file.name,
      p_file_url: publicUrlData?.publicUrl || '',
      p_file_size: file.size,
      p_mime_type: file.type,
      p_validation_status: 'pending',
      p_ocr_data: {
        document_type_id: documentTypeId,
        expiry_date: metadata.expiry_date || null,
        issue_date: metadata.issue_date || null,
        ...metadata
      }
    })

    if (dbError) {
      console.error('[v0] Database RPC error:', dbError)
      // Fallback: try simple insert with only basic fields
      console.log('[v0] Trying fallback insert with minimal fields')
      const { data: fallbackDoc, error: fallbackError } = await adminClient
        .from('uploaded_documents')
        .insert({
          conductor_id: driverId,
          document_type_id: documentTypeId,
          validation_status: 'pending',
          ocr_structured_data: {
            original_filename: file.name,
            file_url: publicUrlData?.publicUrl || '',
            file_size: file.size,
            mime_type: file.type,
            document_type_id: documentTypeId,
            expiry_date: metadata.expiry_date || null,
            issue_date: metadata.issue_date || null,
            ...metadata
          }
        })
        .select()
        .single()
      
      if (fallbackError) {
        console.error('[v0] Fallback insert also failed:', fallbackError)
        return NextResponse.json({ error: 'Failed to save document', details: fallbackError.message }, { status: 500 })
      }
      
      const responseData = {
        success: true,
        document: fallbackDoc,
        message: 'Documento subido exitosamente (fallback mode)',
      }
      console.log('[v0] Fallback insert successful, returning response')
      return NextResponse.json(responseData)
    }

    // RPC worked, return the result
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
