import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Increase max duration for larger file uploads
export const maxDuration = 60

/**
 * POST /api/subcontractors/[id]/documents
 * Upload a document for a subcontractor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params
    
    console.log('[v0] ===== PDF UPLOAD DIAGNOSTIC START =====')
    console.log('[v0] Request method:', request.method)
    console.log('[v0] Content-Type:', request.headers.get('content-type'))
    console.log('[v0] Content-Length:', request.headers.get('content-length'))
    
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const documentTypeId = formData.get('documentTypeId') as string
    const subcontractorRut = formData.get('subcontractorRut') as string

    console.log('[v0] FormData parsed')
    console.log('[v0] File exists:', !!file)
    console.log('[v0] File name:', file?.name)
    console.log('[v0] File type:', file?.type)
    console.log('[v0] File.size property:', file?.size)
    console.log('[v0] documentTypeId:', documentTypeId)

    if (!file || !documentTypeId || !subcontractorRut || !id) {
      console.error('[v0] Missing required fields')
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    console.log('[v0] Starting document upload for subcontractor:', id)

    // Get document type details
    const { data: docType, error: docTypeError } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, periodicidad')
      .eq('id', documentTypeId)
      .single()

    if (docTypeError || !docType) {
      console.error('[v0] Error fetching document type:', docTypeError)
      return NextResponse.json(
        { error: 'Tipo de documento no encontrado' },
        { status: 404 }
      )
    }

    // Upload file to Supabase Storage with simple, safe filename
    const fileExtension = file.name.split('.').pop() || 'pdf'
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
    const fileName = `${id}/${safeFileName}`
    
    // Create documents bucket if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === 'subcontractor-documents')
      
      if (!bucketExists) {
        console.log('[v0] Creating subcontractor-documents bucket...')
        await supabase.storage.createBucket('subcontractor-documents', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })
      }
    } catch (bucketError) {
      console.log('[v0] Bucket check (may already exist):', bucketError)
    }

    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    console.log('[v0] === BUFFER CONVERSION ===')
    console.log('[v0] File.size:', file.size)
    console.log('[v0] ArrayBuffer.byteLength:', buffer.byteLength)
    console.log('[v0] Uint8Array.length:', uint8Array.length)
    console.log('[v0] First 20 bytes:', Array.from(uint8Array.slice(0, 20)))

    if (buffer.byteLength === 0) {
      console.error('[v0] CRITICAL: ArrayBuffer is empty! File.size was:', file.size)
      return NextResponse.json(
        { error: 'El archivo llegó vacío al servidor. Verifica que el archivo no esté corrupto.' },
        { status: 400 }
      )
    }

    if (uint8Array.length === 0) {
      console.error('[v0] CRITICAL: Uint8Array conversion failed!')
      return NextResponse.json(
        { error: 'Error al procesar el archivo en el servidor' },
        { status: 500 }
      )
    }
    
    console.log('[v0] === UPLOADING TO SUPABASE ===')
    console.log('[v0] Filename in storage:', fileName)
    console.log('[v0] Data to upload size:', uint8Array.length + ' bytes')
    console.log('[v0] Content-Type:', file.type)
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('subcontractor-documents')
      .upload(fileName, uint8Array, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      })

    if (uploadError) {
      console.error('[v0] UPLOAD FAILED:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir el archivo: ' + uploadError.message },
        { status: 500 }
      )
    }

    console.log('[v0] UPLOAD SUCCESS')
    console.log('[v0] Storage path:', uploadData.path)
    console.log('[v0] Full path:', uploadData.fullPath)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('subcontractor-documents')
      .getPublicUrl(fileName)

    // Calculate expiry date based on periodicity
    const now = new Date()
    let expiresAt = new Date(now)
    
    if (docType.periodicidad === 'Mensual') {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else if (docType.periodicidad === 'Trimestral') {
      expiresAt.setMonth(expiresAt.getMonth() + 3)
    } else if (docType.periodicidad === 'Anual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    }

    // Save document record
    const { data: newDocument, error: saveError } = await supabase
      .from('subcontractor_documents')
      .insert({
        subcontractor_id: id,
        subcontractor_rut: subcontractorRut,
        document_type_id: documentTypeId,
        file_url: publicUrl,
        file_name: file.name,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error('[v0] Error saving document record:', saveError)
      return NextResponse.json(
        { error: 'Error al guardar el documento' },
        { status: 500 }
      )
    }

    // Create alert for pending review
    const { error: alertError } = await supabase
      .from('subcontractor_document_alerts')
      .insert({
        subcontractor_id: id,
        document_id: newDocument.id,
        alert_type: 'pending_review',
        message: `Nuevo documento ${docType.code} subido - Pendiente de revisión`,
      })

    if (alertError) {
      console.warn('[v0] Warning: Could not create alert:', alertError)
    }

    console.log('[v0] Document uploaded successfully:', newDocument.id)

    return NextResponse.json({
      success: true,
      document: newDocument,
      message: `Documento subido exitosamente. Se vencerá el ${expiresAt.toLocaleDateString('es-CL')}`,
    })

  } catch (error) {
    console.error('[v0] Error in document upload:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subcontractors/[id]/documents
 * Fetch all documents for a specific subcontractor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Subcontractor ID is required' },
        { status: 400 }
      )
    }

    // Fetch documents uploaded by this subcontractor
    const { data: documents, error: docsError } = await supabase
      .from('subcontractor_documents')
      .select(`
        *,
        document_type:subcontractor_document_types(code, nombre, periodicidad)
      `)
      .eq('subcontractor_id', id)
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      console.error('[v0] Error fetching documents:', docsError)
      return NextResponse.json(
        { error: 'Error al obtener documentos' },
        { status: 500 }
      )
    }

    // Fetch document types (requirements)
    const { data: documentTypes, error: typesError } = await supabase
      .from('subcontractor_document_types')
      .select('*')
      .eq('es_obligatorio', true)
      .order('nombre', { ascending: true })

    if (typesError) {
      console.error('[v0] Error fetching document types:', typesError)
      return NextResponse.json(
        { error: 'Error al obtener tipos de documento' },
        { status: 500 }
      )
    }

    // Calculate summary
    const summary = {
      totalDocumentsUploaded: documents?.length || 0,
      totalRequirements: documentTypes?.length || 0,
      approvedDocuments: documents?.filter((d) => d.status === 'approved').length || 0,
      pendingDocuments: documents?.filter((d) => d.status === 'pending').length || 0,
      expiredDocuments: documents?.filter((d) => d.status === 'expired').length || 0,
      rejectedDocuments: documents?.filter((d) => d.status === 'rejected').length || 0,
    }

    return NextResponse.json({
      success: true,
      subcontractorId: id,
      documents: documents || [],
      requirements: documentTypes || [],
      summary,
    })

  } catch (error) {
    console.error('[v0] Error in subcontractor documents GET:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
