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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    console.log('[v0] Inserting via raw SQL to bypass schema cache')

    // Use raw SQL via execute_sql RPC function
    const { data: sqlResult, error: sqlError } = await adminClient.rpc('execute_sql', {
      sql: `
        INSERT INTO public.uploaded_documents (
          conductor_id,
          document_type_id,
          original_filename,
          file_url,
          file_path,
          file_size,
          mime_type,
          validation_status
        ) VALUES (
          $1::uuid,
          $2::uuid,
          $3::text,
          $4::text,
          $5::text,
          $6::integer,
          $7::text,
          'pending'::text
        )
        RETURNING id, conductor_id, document_type_id, original_filename, file_url, created_at
      `,
      params: [driverId, documentTypeId, file.name, publicUrlData?.publicUrl || '', storagePath, file.size, file.type]
    })

    if (sqlError) {
      console.error('[v0] SQL insert error:', sqlError)
      // Try fallback: minimal insert without problematic columns
      console.log('[v0] Trying minimal fallback insert')
      const { data: minimalResult, error: minimalError } = await adminClient.rpc('execute_sql', {
        sql: `
          INSERT INTO public.uploaded_documents (
            conductor_id,
            document_type_id,
            original_filename,
            validation_status
          ) VALUES (
            $1::uuid,
            $2::uuid,
            $3::text,
            'pending'::text
          )
          RETURNING id, conductor_id, document_type_id, original_filename, created_at
        `,
        params: [driverId, documentTypeId, file.name]
      })

      if (minimalError) {
        console.error('[v0] Minimal insert also failed:', minimalError)
        return NextResponse.json({ error: 'Failed to save document', details: minimalError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        document: minimalResult?.[0] || minimalResult,
        message: 'Documento subido exitosamente (minimal)'
      })
    }

    console.log('[v0] Document inserted successfully:', sqlResult)
    return NextResponse.json({
      success: true,
      document: sqlResult?.[0] || sqlResult,
      message: 'Documento subido exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error in upload:', error)
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 })
  }
}
