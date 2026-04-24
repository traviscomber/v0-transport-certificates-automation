'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const driverRut = formData.get('driverRut') as string
    const documentType = formData.get('document_type') as string || 'Documento'

    console.log('[v0] Upload start:', { driverRut, documentType, fileName: file?.name })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!driverRut) {
      return NextResponse.json({ error: 'Driver RUT required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Generar path único
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
    const filePath = `drivers/${driverRut}/${timestamp}_${sanitizedFileName}`

    console.log('[v0] Uploading file to storage:', filePath)

    // Subir a Storage
    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      console.error('[v0] Storage error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    console.log('[v0] File uploaded successfully:', filePath)

    // Obtener URL pública
    const { data } = adminClient.storage.from('documents').getPublicUrl(filePath)
    const publicUrl = data?.publicUrl || ''

    // Crear objeto de documento
    const doc = {
      id: `${timestamp}_${driverRut}`,
      driver_rut: driverRut,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      document_type: documentType,
      storage_path: filePath,
      public_url: publicUrl,
      upload_date: new Date().toISOString(),
      status: 'uploaded'
    }

    return NextResponse.json({
      success: true,
      document: doc,
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
