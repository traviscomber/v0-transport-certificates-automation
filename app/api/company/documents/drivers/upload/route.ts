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

    // Buscar el ID del conductor por RUT (normalizar formato)
    // Primero intenta búsqueda exacta
    let { data: drivers, error: driverError } = await adminClient
      .from('conductores')
      .select('id, rut, nombre')
      .eq('rut', driverRut)
      .single()

    // Si no encuentra, busca con búsqueda flexible (ilike)
    if (driverError && !drivers) {
      console.log('[v0] Exact RUT match not found, trying flexible search...')
      const { data: flexDrivers } = await adminClient
        .from('conductores')
        .select('id, rut, nombre')
        .ilike('rut', `%${driverRut}%`)
        .limit(1)

      if (flexDrivers && flexDrivers.length > 0) {
        drivers = flexDrivers[0]
        driverError = null
        console.log('[v0] Found driver with flexible search:', drivers)
      }
    }

    if (driverError || !drivers?.id) {
      console.error('[v0] Driver not found for RUT:', driverRut, 'Error:', driverError)
      
      // Log available drivers for debugging
      const { data: allDrivers } = await adminClient
        .from('conductores')
        .select('rut, nombre')
        .limit(5)
      console.log('[v0] Sample drivers in database:', allDrivers)
      
      return NextResponse.json(
        { error: `Conductor con RUT ${driverRut} no encontrado. Verifica el formato del RUT.` },
        { status: 404 }
      )
    }

    const driverId = drivers.id
    console.log('[v0] Found driver:', { driverRut: drivers.rut, driverId, nombre: drivers.nombre })

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
        driver_id: driverId,
        document_type: category,
        file_name: file.name,
        file_url: publicUrl,
        status: 'pendiente'
      }

      // Guardar en la base de datos
      const { error: saveError, data: savedDoc } = await adminClient
        .from('driver_documents')
        .insert([doc])
        .select()
        .single()

      if (saveError) {
        console.error('[v0] Error saving document to database:', saveError)
        // Continue anyway - file is in storage
      } else {
        console.log('[v0] Document saved to database:', savedDoc?.id)
        uploadedDocs.push(savedDoc)
      }
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
