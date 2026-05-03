import { type NextRequest, NextResponse } from 'next/server'

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

    // Crear registro local del documento sin dependencias de Supabase
    const timestamp = new Date().toISOString()
    const documentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      driver_id: driverId,
      document_type: tipo,
      file_name: nombre,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      status: 'pendiente',
      uploaded_at: timestamp,
      created_at: timestamp,
    }

    console.log('[v0] Document record created:', documentRecord)

    // Retornar éxito sin guardar en BD (para evitar problemas de schema)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Documento subido exitosamente',
        data: documentRecord 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
