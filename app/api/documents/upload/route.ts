import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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

    // Crear cliente de Supabase del servidor
    const supabase = await createServerClient()

    // Guardar registro en base de datos
    console.log('[v0] Saving document record:', { driverId, tipo, nombre })
    const { data: dbData, error: dbError } = await supabase
      .from('driver_documents')
      .insert([
        {
          driver_id: driverId,
          document_type: tipo,
          file_name: nombre,
          file_url: `/documents/${driverId}/${nombre}`,
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

    console.log('[v0] Document registered successfully:', dbData)
    return NextResponse.json({ success: true, data: dbData }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
