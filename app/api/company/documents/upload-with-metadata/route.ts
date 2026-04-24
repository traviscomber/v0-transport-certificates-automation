import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverRut = formData.get('driver_rut') as string
    const documentTypeId = formData.get('document_type_id') as string
    const metadataStr = formData.get('metadata') as string

    if (!file || !driverRut || !documentTypeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const metadata = JSON.parse(metadataStr || '{}')
    const adminClient = createAdminClient()

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`
    const storagePath = `drivers/${driverRut}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(storagePath)

    // Create document record in database
    const { data: docRecord, error: dbError } = await adminClient
      .from('documents')
      .insert({
        driver_rut: driverRut,
        file_name: file.name,
        storage_path: storagePath,
        public_url: publicUrlData?.publicUrl || '',
        document_type_id: documentTypeId,
        document_number: metadata.document_number || null,
        expiry_date: metadata.expiry_date || null,
        provider: metadata.provider || null,
        notes: metadata.notes || null,
        category: metadata.category || null,
        tags: metadata.tags || [],
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    console.log('[v0] Document uploaded successfully:', {
      documentTypeId,
      driverRut,
      fileName,
    })

    return NextResponse.json({
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente',
    })
  } catch (error) {
    console.error('[v0] Error in POST /api/company/documents/upload-with-metadata:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
