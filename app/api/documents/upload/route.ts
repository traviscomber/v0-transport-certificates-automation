import { createAdminClient } from '@/lib/supabase/admin'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const requirementId = formData.get('requirementId') as string
    const subcontractorId = formData.get('subcontractorId') as string
    const driverId = formData.get('driverId') as string
    const tipo = formData.get('tipo') as string
    const nombre = formData.get('nombre') as string

    // Support both driver uploads (old) and subcontractor uploads (new)
    if (subcontractorId && requirementId && file) {
      // New: Subcontractor document upload
      return await handleSubcontractorUpload(file, requirementId, subcontractorId)
    } else if (driverId && tipo && nombre && file) {
      // Old: Driver document upload (backward compatibility)
      return await handleDriverUpload(file, driverId, tipo, nombre)
    } else {
      return NextResponse.json(
        { error: 'Missing required fields. Provide either (subcontractorId, requirementId, file) or (driverId, tipo, nombre, file)' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}

async function handleSubcontractorUpload(file: File, requirementId: string, subcontractorId: string) {
  const supabase = createAdminClient()

  // Get the requirement to get the code
  const { data: requirement, error: reqError } = await supabase
    .from('document_requirements')
    .select('code, nombre')
    .eq('id', requirementId)
    .single()

  if (reqError || !requirement) {
    return NextResponse.json(
      { error: 'Requirement not found' },
      { status: 404 }
    )
  }

  // Upload file to storage
  const fileName = `${subcontractorId}/${requirement.code}/${Date.now()}-${file.name}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('subcontractor-documents')
    .upload(fileName, buffer, {
      contentType: file.type,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 }
    )
  }

  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('subcontractor-documents')
    .getPublicUrl(uploadData.path)

  // Create document record in database
  const { data: doc, error: dbError } = await supabase
    .from('subcontractor_documents')
    .insert([
      {
        subcontractor_id: subcontractorId,
        file_name: file.name,
        document_type_id: requirementId,
        file_url: publicUrl,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('subcontractor-documents').remove([fileName])
    return NextResponse.json(
      { error: `Database error: ${dbError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    id: doc.id,
    file_name: doc.file_name,
    status: doc.status,
    uploaded_at: doc.uploaded_at,
    file_url: doc.file_url,
  })
}

async function handleDriverUpload(file: File, driverId: string, tipo: string, nombre: string) {
  // Keep existing driver upload logic
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

  return NextResponse.json(
    {
      success: true,
      message: 'Documento subido exitosamente',
      data: documentRecord,
    },
    { status: 201 }
  )
}
