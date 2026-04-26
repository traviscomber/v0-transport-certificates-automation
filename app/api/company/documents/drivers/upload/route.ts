import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allDriversData } from '@/lib/data/all-drivers'
import { triggerDocumentUploadedAlert } from '@/lib/operations/alert-triggers'

export const dynamic = 'force-dynamic'

const normalizeRUT = (rut: string | undefined) => {
  if (!rut) return ''
  return rut.trim().replace(/[.-]/g, '').toUpperCase()
}

export async function POST(request: NextRequest) {
  console.log('[v0] ==================== POST ENDPOINT CALLED ====================')
  try {
    const formData = await request.formData()
    console.log('[v0] FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? `File(${v.name})` : v]))
    
    const file = formData.get('files') as File  // Hook sends 'files'
    const driverRut = formData.get('driverRut') as string
    const documentType = formData.get('category') as string  // Hook sends 'category'

    console.log('[v0] Upload request:', { driverRut, documentType, fileName: file?.name, fileSize: file?.size })

    // Validate inputs
    if (!file) {
      console.error('[v0] No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!driverRut) {
      console.error('[v0] No driver RUT provided')
      return NextResponse.json({ error: 'Driver RUT required' }, { status: 400 })
    }

    // Find driver
    const normalizedInputRut = normalizeRUT(driverRut)
    let drivers = null
    for (const localDriver of allDriversData) {
      if (normalizeRUT(localDriver.rut) === normalizedInputRut) {
        drivers = localDriver
        break
      }
    }

    if (!drivers?.id) {
      console.error('[v0] Driver not found:', driverRut)
      return NextResponse.json(
        { error: `Conductor con RUT ${driverRut} no encontrado en el sistema.` },
        { status: 404 }
      )
    }

    const driverId = drivers.id
    console.log('[v0] Found driver:', { driverId, rut: drivers.rut, name: `${drivers.nombres} ${drivers.apellidos}` })

    // Initialize Supabase
    const adminClient = await createAdminClient()

    // Upload to storage
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
    const filePath = `drivers/${driverRut}/${timestamp}_${sanitizedFileName}`

    console.log('[v0] Uploading to storage:', filePath)

    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError, data: uploadData } = await adminClient.storage
      .from('documents')
      .upload(filePath, fileBuffer, { 
        contentType: file.type,
        upsert: true 
      })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Error uploading to storage' }, { status: 500 })
    }

    console.log('[v0] File uploaded to storage successfully')

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`
    console.log('[v0] Public URL:', publicUrl)

    // Insert to database
    console.log('[v0] Inserting document to database:', {
      driver_id: String(driverId),
      file_name: file.name,
      document_type: documentType,
      file_url: publicUrl,
      status: 'pendiente'
    })

    const { data: savedDoc, error: saveError } = await adminClient
      .from('driver_documents')
      .insert({
        driver_id: String(driverId),
        file_name: file.name,
        document_type: documentType,
        file_url: publicUrl,
        status: 'pendiente'
      })
      .select()
      .single()

    if (saveError) {
      console.error('[v0] Database insert error:', {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details
      })
    } else {
      console.log('[v0] ✅ Document inserted successfully:', { id: savedDoc?.id })
    }

    // Trigger alert
    try {
      await triggerDocumentUploadedAlert(
        driverId,
        file.name,
        `${drivers.nombres} ${drivers.apellidos}`
      )
    } catch (alertError) {
      console.error('[v0] Alert trigger error:', alertError)
    }

    return NextResponse.json({
      success: true,
      message: 'Documento subido exitosamente',
      documents: savedDoc ? [savedDoc] : []
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
