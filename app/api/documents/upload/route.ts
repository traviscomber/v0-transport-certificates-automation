import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const driverId = formData.get('driverId') as string
    const tipo = formData.get('tipo') as string
    const nombre = formData.get('nombre') as string
    const file = formData.get('file') as File

    if (!driverId || !tipo || !nombre || !file) {
      console.error('[v0] Missing fields:', { driverId: !!driverId, tipo: !!tipo, nombre: !!nombre, file: !!file })
      return NextResponse.json(
        { error: 'Missing required fields: driverId, tipo, nombre, file' },
        { status: 400 }
      )
    }

    // Convertir file a buffer
    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const uniqueFileName = `${driverId}/${tipo}/${timestamp}-${nombre}`

    // Subir archivo a Supabase Storage
    console.log('[v0] Uploading file to storage:', uniqueFileName)
    const { data: storageData, error: storageError } = await supabase.storage
      .from('driver-documents')
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (storageError) {
      console.error('[v0] Storage upload error:', storageError)
      return NextResponse.json(
        { error: `Failed to upload file: ${storageError.message}` },
        { status: 400 }
      )
    }

    // Obtener URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from('driver-documents')
      .getPublicUrl(uniqueFileName)

    // Insertar registro en base de datos
    const { data: dbData, error: dbError } = await supabase
      .from('driver_documents')
      .insert([
        {
          driver_id: driverId,
          document_type: tipo,
          file_name: nombre,
          file_url: publicUrlData.publicUrl,
          status: 'pendiente',
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select()

    if (dbError) {
      console.error('[v0] Database error inserting document:', dbError)
      return NextResponse.json(
        { error: `Failed to save document record: ${dbError.message}` },
        { status: 400 }
      )
    }

    console.log('[v0] Document uploaded successfully:', dbData)
    return NextResponse.json({ success: true, data: dbData }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
