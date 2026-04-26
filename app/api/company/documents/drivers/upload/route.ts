'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { allDriversData } from '@/lib/data/all-drivers'
import { triggerDocumentUploadedAlert } from '@/lib/operations/alert-triggers'

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

    // Asegurar que el bucket existe y está configurado correctamente como PUBLIC
    try {
      const { data: buckets } = await adminClient.storage.listBuckets()
      const bucket = buckets?.find((b: any) => b.name === 'documents')
      
      if (!bucket) {
        console.log('[v0] Creating documents bucket as PUBLIC...')
        await adminClient.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        })
        console.log('[v0] Bucket created successfully as PUBLIC')
      } else if (!bucket.public) {
        // Si el bucket existe pero NO es público, intentar actualizarlo
        console.log('[v0] Bucket exists but is PRIVATE. Attempting to make it PUBLIC...')
        try {
          await adminClient.storage.updateBucket('documents', {
            public: true
          })
          console.log('[v0] Bucket updated to PUBLIC')
        } catch (updateError) {
          console.log('[v0] Could not update bucket to public:', updateError)
        }
      } else {
        console.log('[v0] Bucket exists and is PUBLIC:', {
          name: bucket.name,
          public: bucket.public,
          created_at: bucket.created_at
        })
      }
    } catch (bucketError) {
      console.log('[v0] Bucket check/create result:', bucketError)
    }

    // Normalizar RUT
    const normalizeRUT = (rut: string | undefined) => {
      if (!rut) return ''
      return rut.trim().replace(/[.-]/g, '').toUpperCase()
    }
    
    const normalizedInputRut = normalizeRUT(driverRut)
    console.log('[v0] Searching for driver with RUT:', driverRut, '(normalized:', normalizedInputRut, ')')

    // Buscar en datos locales allDriversData
    let drivers = null
    for (const localDriver of allDriversData) {
      const localRutNormalized = normalizeRUT(localDriver.rut)
      if (localRutNormalized === normalizedInputRut) {
        drivers = localDriver
        console.log('[v0] Found driver in local data:', { 
          id: drivers.id,
          rut: localDriver.rut,
          name: `${localDriver.nombres} ${localDriver.apellidos}`
        })
        break
      }
    }

    // Si no encuentra, retornar error
    if (!drivers?.id) {
      console.error('[v0] Driver not found for RUT:', driverRut)
      return NextResponse.json(
        { 
          error: `Conductor con RUT ${driverRut} no encontrado en el sistema.`
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

      console.log('[v0] ==================== ABOUT TO CREATE DOC OBJECT ====================')
      
      // Crear objeto de documento con la URL completa
      const doc = {
        driver_id: String(driverId),  // Ensure it's a string
        file_name: file.name,
        document_type: category,
        file_url: publicUrl,  // Guardar la URL completa
        status: 'pendiente'
      }

      console.log('[v0] Document object to insert:', doc)

      // Guardar en la base de datos tabla `driver_documents`
      try {
        const { error: saveError, data: savedDocs } = await adminClient
          .from('driver_documents')
          .insert([doc])
          .select()

        console.log('[v0] ✅ INSERT attempt result:', {
          driverId,
          documentType: category,
          fileName: file.name,
          hasError: !!saveError,
          savedDocsArray: Array.isArray(savedDocs) && savedDocs.length > 0,
          arrayLength: Array.isArray(savedDocs) ? savedDocs.length : 'not_array',
          errorCode: saveError?.code,
          errorMessage: saveError?.message,
          errorDetails: saveError?.details,
          firstDocId: Array.isArray(savedDocs) && savedDocs[0] ? savedDocs[0].id : null
        })

        if (saveError) {
          console.error('[v0] ❌ ERROR saving document to database:', {
            code: saveError.code,
            message: saveError.message,
            details: saveError.details,
            hint: saveError.hint
          })
          // Continue anyway - file is in storage
        } else if (Array.isArray(savedDocs) && savedDocs.length > 0) {
          const savedDoc = savedDocs[0]
          console.log('[v0] ✅ DOCUMENTO INSERTADO en database:', { id: savedDoc.id, fileName: file.name, driverId })
          uploadedDocs.push(savedDoc)
        } else {
          console.warn('[v0] ⚠️ INSERT returned no error but savedDocs is:', {
            type: typeof savedDocs,
            isArray: Array.isArray(savedDocs),
            value: savedDocs
          })
        }
      } catch (insertException) {
        console.error('[v0] ❌ EXCEPTION during INSERT:', {
          message: insertException instanceof Error ? insertException.message : String(insertException),
          stack: insertException instanceof Error ? insertException.stack : undefined
        })
      }
    }

    // Trigger alert para cada documento subido
    for (const doc of uploadedDocs) {
      try {
        // Obtener nombre del conductor desde allDriversData
        const driver = allDriversData.find(d => d.id === driverId)
        const driverName = driver ? `${driver.nombres} ${driver.apellidos}` : undefined
        
        await triggerDocumentUploadedAlert(
          driverId,
          doc.file_name,
          driverName
        )
      } catch (alertError) {
        console.error('[v0] Error triggering alert:', alertError)
      }
    }

    // Debug: Verificar qué se guard�� en la BD
    console.log('[v0] Upload completed successfully with', uploadedDocs.length, 'documents')
    console.log('[v0] ========== DOCUMENT UPLOAD END ==========')

    return NextResponse.json({
      success: true,
      message: `${uploadedDocs.length} documento(s) subido(s) exitosamente`,
      documents: uploadedDocs
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
