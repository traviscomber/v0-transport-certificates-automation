'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const driverRut = formData.get('driverRut') as string
    const category = formData.get('category') as string || 'Documento'

    console.log('[v0] Upload start:', { driverRut, category, fileCount: files.length })

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!driverRut) {
      return NextResponse.json({ error: 'Driver RUT required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const uploadedDocs = []

    // Asegurar que el bucket existe
    try {
      const { data: buckets } = await adminClient.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === 'documents')
      
      if (!bucketExists) {
        console.log('[v0] Creating documents bucket...')
        await adminClient.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })
        console.log('[v0] Bucket created successfully')
      }
    } catch (bucketError) {
      console.log('[v0] Bucket check/create attempt (may already exist):', bucketError)
    }

    // Procesar cada archivo
    for (const file of files) {
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
        continue
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
        document_type: category,
        storage_path: filePath,
        public_url: publicUrl,
        upload_date: new Date().toISOString(),
        status: 'uploaded'
      }

      uploadedDocs.push(doc)
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocs,
      message: `${uploadedDocs.length} documento(s) subido(s) exitosamente`
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
