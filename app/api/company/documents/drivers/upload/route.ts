'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { allDriversData } from '@/lib/data/all-drivers'
import { triggerDocumentUploadedAlert } from '@/lib/operations/alert-triggers'
import { debugDocuments } from '@/lib/debug/document-checker'

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

  const adminClient = await createAdminClient()
    const uploadedDocs = []

    // Asegurar que el bucket existe y está configurado correctamente
    try {
      const { data: buckets } = await adminClient.storage.listBuckets()
      const bucket = buckets?.find((b: any) => b.name === 'documents')
      
      if (!bucket) {
        console.log('[v0] Creating documents bucket...')
        await adminClient.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        })
        console.log('[v0] Bucket created successfully')
      } else {
        console.log('[v0] Bucket exists, details:', {
          name: bucket.name,
          public: bucket.public,
          created_at: bucket.created_at,
          id: bucket.id
        })
      }
    } catch (bucketError) {
      console.log('[v0] Bucket check/create result:', bucketError)
    }
    } catch (bucketError) {
      console.log('[v0] Bucket check/create attempt (may already exist):', bucketError)
    }

    // Normalizar RUT igual que en el componente: remover puntos/guiones, convertir a mayúsculas
    const normalizeRUT = (rut: string | undefined) => {
      if (!rut) return ''
      return rut.trim().replace(/[.-]/g, '').toUpperCase()
    }
    
    const normalizedInputRut = normalizeRUT(driverRut)
    console.log('[v0] Searching for driver with RUT:', driverRut, '(normalized:', normalizedInputRut, ')')
    
    // Usar createClient regular que respeta RLS policies
    const regularClient = await createClient()
    
    // Buscar el ID del conductor por RUT
    const { data: allConductores, error: fetchError } = await regularClient
      .from('conductores')
      .select('id, rut, nombres')
    
    if (fetchError || !allConductores) {
      console.error('[v0] Error fetching conductores:', fetchError)
      return NextResponse.json(
        { error: 'Error al buscar conductores' },
        { status: 500 }
      )
    }

    console.log('[v0] Total conductores in DB:', allConductores.length)

    // Buscar coincidencia normalizando ambos lados
    let drivers = null
    for (const conductor of allConductores) {
      const dbRutNormalized = normalizeRUT(conductor.rut)
      if (dbRutNormalized === normalizedInputRut) {
        drivers = conductor
        console.log('[v0] Found driver in DB:', { 
          input: driverRut, 
          stored: conductor.rut, 
          normalized: normalizedInputRut, 
          match: true 
        })
        break
      }
    }

    // Si no encuentra en Supabase, buscar en datos locales como fallback
    if (!drivers?.id) {
      console.log('[v0] Not found in Supabase, searching in local data...')
      for (const localDriver of allDriversData) {
        const localRutNormalized = normalizeRUT(localDriver.rut)
        if (localRutNormalized === normalizedInputRut) {
          drivers = {
            id: localDriver.id || `local_${localDriver.rut}`,
            rut: localDriver.rut,
            nombres: localDriver.nombres
          }
          console.log('[v0] Found driver in local data:', { 
            input: driverRut, 
            stored: localDriver.rut, 
            normalized: normalizedInputRut, 
            source: 'local'
          })
          break
        }
      }
    }

    // Si aún no encuentra, retornar error con ejemplos
    if (!drivers?.id) {
      console.error('[v0] Driver not found for RUT:', driverRut)
      const sampleRuts = allDriversData.slice(0, 5).map(d => {
        const norm = normalizeRUT(d.rut)
        return `${d.rut} (normalized: ${norm}) - ${d.nombres}`
      })
      console.log('[v0] Sample RUT values available:', sampleRuts)
      
      return NextResponse.json(
        { 
          error: `Conductor con RUT ${driverRut} no encontrado.`,
          availableSample: sampleRuts
        },
        { status: 404 }
      )
    }

    const driverId = drivers.id
    console.log('[v0] Using driver ID:', driverId, 'for RUT:', drivers.rut)

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

      console.log('[v0] File uploaded successfully to storage:', filePath)

      // IMPORTANTE: getPublicUrl es síncrono y siempre retorna una URL
      // No necesita await, retorna {data: {publicUrl: '...'}}
      const publicUrlResponse = adminClient.storage.from('documents').getPublicUrl(filePath)
      
      console.log('[v0] getPublicUrl response:', {
        hasData: !!publicUrlResponse.data,
        publicUrl: publicUrlResponse.data?.publicUrl,
        pathUsed: filePath,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      })
      
      // Usar la URL retornada por getPublicUrl - siempre construye correctamente
      let publicUrl = publicUrlResponse.data?.publicUrl || ''
      
      // Fallback: si por alguna razón no retorna nada, construir manualmente
      if (!publicUrl) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`
        console.log('[v0] Using fallback URL construction:', publicUrl)
      }
      
      console.log('[v0] Final public URL for storage:', { filePath, publicUrl, urlLength: publicUrl?.length })

      // Crear objeto de documento con la URL completa
      const doc = {
        driver_id: driverId,
        file_name: file.name,
        document_type: category,
        file_url: publicUrl,  // Guardar la URL completa
        status: 'pendiente'
      }

      // Guardar en la base de datos tabla `driver_documents`
      const { error: saveError, data: savedDoc } = await adminClient
        .from('driver_documents')
        .insert([doc])
        .select()
        .single()

      console.log('[v0] Save attempt to driver_documents table:', {
        driverId,
        documentType: category,
        fileName: file.name,
        error: saveError?.message,
        saved: !!savedDoc
      })

      if (saveError) {
        console.error('[v0] ❌ ERROR saving document to database:', saveError.message, saveError.details)
        // Continue anyway - file is in storage
      } else if (savedDoc) {
        console.log('[v0] ✅ DOCUMENTO INSERTADO en database:', { id: savedDoc.id, fileName: file.name, driverId })
        uploadedDocs.push(savedDoc)
      }
    }

    // Trigger alert para cada documento subido
    for (const doc of uploadedDocs) {
      try {
        await triggerDocumentUploadedAlert({
          driver_id: driverId,
          document_id: doc.id,
          document_type: doc.document_type,
          file_name: doc.file_name
        })
      } catch (alertError) {
        console.error('[v0] Error triggering alert:', alertError)
      }
    }

    // Debug: Verificar qué se guardó en la BD
    console.log('[v0] === CALLING DEBUG AFTER UPLOAD ===')
    await debugDocuments()

    return NextResponse.json({
      success: true,
      message: `${uploadedDocs.length} documento(s) subido(s) exitosamente`,
      documents: uploadedDocs
    })

      await triggerDocumentUploadedAlert(
        driverId,
        uploadedDocs[0]?.file_name || 'Documento',
        driverInfo?.nombres || 'Un conductor'
      )
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
