import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const driverId = formData.get('driverId') as string
    const tipo = formData.get('tipo') as string
    const nombre = formData.get('nombre') as string
    const file = formData.get('file') as File

    console.log('[v0] Upload request received:', { driverId, tipo, nombre, fileSize: file?.size })

    if (!driverId || !tipo || !nombre || !file) {
      console.error('[v0] Missing fields:', { driverId: !!driverId, tipo: !!tipo, nombre: !!nombre, file: !!file })
      return NextResponse.json(
        { error: 'Missing required fields: driverId, tipo, nombre, file' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase con ANON_KEY (más confiable que SERVICE_ROLE)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey) {
      console.error('[v0] Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Guardar en tabla certificates solo con los campos necesarios que no son referencias
    console.log('[v0] Saving certificate record:', { driverId, tipo, nombre })
    
    const timestamp = Date.now()
    const fileName = `${driverId}/${tipo}/${timestamp}-${nombre}`
    
    const { data: dbData, error: dbError } = await supabase
      .from('certificates')
      .insert([
        {
          driver_id: driverId,
          file_name: nombre,
          file_url: fileName,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          status: 'pending',
          document_number: tipo,
          notes: `Uploaded certificate: ${tipo}`,
        },
      ])
      .select()

    if (dbError) {
      console.error('[v0] Database error inserting certificate:', dbError)
      return NextResponse.json(
        { error: `Failed to save certificate record: ${dbError.message}` },
        { status: 400 }
      )
    }

    console.log('[v0] Certificate registered successfully:', dbData)
    return NextResponse.json({ success: true, data: dbData }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
