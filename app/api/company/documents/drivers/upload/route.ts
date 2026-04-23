'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Soportar tanto file único como files múltiples
    let files: File[] = []
    const singleFile = formData.get('file') as File | null
    const multipleFiles = formData.getAll('files') as File[]
    
    if (singleFile) {
      files = [singleFile]
    } else if (multipleFiles.length > 0) {
      files = multipleFiles
    } else {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Obtener driverRut del formulario
    const driverRut = formData.get('driverRut') as string
    const documentType = formData.get('document_type') as string || 'Documento'
    const fileName = formData.get('file_name') as string

    console.log('[v0] Driver document upload:', { driverRut, documentType, fileCount: files.length, fileName })

    if (!driverRut) {
      return NextResponse.json(
        { error: 'Driver RUT required in request body' },
        { status: 400 }
      )
    }

    if (!files.length) {
      return NextResponse.json(
        { error: 'Files required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    console.log('[v0] Uploading documents for driver RUT:', driverRut)

    // Upload each file
    const uploadedDocs = []
    for (const file of files) {
      // Usar timestamp para evitar duplicados
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
      const filePath = `drivers/${driverRut}/${timestamp}_${sanitizedFileName}`

      console.log('[v0] Uploading to path:', filePath)

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await adminClient.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('[v0] Storage upload error:', uploadError)
        continue
      }

      console.log('[v0] File uploaded to storage:', filePath)

      // Save metadata to documents table (only use columns that exist)
      const { data: doc, error: docError } = await adminClient
        .from('documents')
        .insert({
          file_name: file.name,
          file_size: file.size.toString(),
          file_type: file.type,
          document_type: documentType,
          // upload_date will use DEFAULT CURRENT_DATE from the schema
        })
        .select()
        .single()

      if (docError) {
        console.error('[v0] Error saving document metadata:', docError)
        continue
      }

      if (!doc) {
        console.error('[v0] No document returned after insert')
        continue
      }

      console.log('[v0] Document saved with ID:', doc.id)

      // Link document to driver via transporters table
      const { error: linkError } = await adminClient
        .from('transporters')
        .insert({
          document_id: doc.id,
          rut: driverRut,
          name: `Documento ${documentType}`,
        })

      if (linkError) {
        console.error('[v0] Error linking to transporter:', linkError)
        // Continue anyway - document was saved
      } else {
        console.log('[v0] Linked document to transporter with RUT:', driverRut)
      }

      uploadedDocs.push(doc)
    }

    if (uploadedDocs.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload documents' },
        { status: 500 }
      )
    }

    console.log('[v0] Upload complete:', uploadedDocs.length, 'documents')

    return NextResponse.json({
      success: true,
      message: `${uploadedDocs.length} document(s) uploaded successfully`,
      document: uploadedDocs[0],
      documents: uploadedDocs,
    })
  } catch (error) {
    console.error('[v0] Error uploading driver documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading documents' },
      { status: 500 }
    )
  }
}
