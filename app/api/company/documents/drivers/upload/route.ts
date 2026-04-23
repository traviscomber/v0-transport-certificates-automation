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

    // Obtener driverId del contexto autenticado o del formulario
    const formDriverId = formData.get('driverId') as string
    let driverId = formDriverId
    
    const documentType = formData.get('document_type') as string || 'Documento'
    const fileName = formData.get('file_name') as string

    console.log('[v0] Driver document upload:', { driverId, documentType, fileCount: files.length, fileName })

    if (!files.length) {
      return NextResponse.json(
        { error: 'Files required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Si no viene driverId, intentar obtenerlo del usuario autenticado
    if (!driverId) {
      const { data: { user } } = await adminClient.auth.admin.listUsers()
      // This is a fallback - ideally pass driverId in request
      return NextResponse.json(
        { error: 'Driver ID required in request body' },
        { status: 400 }
      )
    }

    // Verify driver exists
    const { data: driver, error: driverError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', driverId)
      .single()

    if (driverError || !driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Found driver:', driver.full_name)

    // Upload each file
    const uploadedDocs = []
    for (const file of files) {
      // Usar timestamp para evitar duplicados
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
      const filePath = `drivers/${driverId}/${timestamp}_${sanitizedFileName}`

      console.log('[v0] Uploading to path:', filePath)

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await adminClient.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Prevenir sobrescrituras
        })

      if (uploadError) {
        console.error('[v0] Storage upload error:', uploadError)
        continue
      }

      console.log('[v0] File uploaded to storage:', filePath)

      // Get signed URL
      const { data: { publicUrl } } = adminClient.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Verificar que no exista un documento duplicado (mismo driver + mismo nombre + mismo día)
      const today = new Date().toISOString().split('T')[0]
      const { data: existingDoc } = await adminClient
        .from('documents')
        .select('id')
        .eq('driver_id', driverId)
        .eq('file_name', file.name)
        .gte('upload_date', `${today}T00:00:00`)
        .lte('upload_date', `${today}T23:59:59`)
        .single()

      if (existingDoc) {
        console.log('[v0] Duplicate document found, deleting old version:', existingDoc.id)
        // Eliminar el documento duplicado más antiguo
        await adminClient
          .from('documents')
          .delete()
          .eq('id', existingDoc.id)
      }

      // Save metadata to documents table
      const { data: doc, error: docError } = await adminClient
        .from('documents')
        .insert({
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          document_type: documentType,
          driver_id: driverId,
          storage_path: filePath,
          public_url: publicUrl,
          upload_date: new Date().toISOString(),
          verification_status: 'pending',
        })
        .select()
        .single()

      if (!docError && doc) {
        uploadedDocs.push(doc)
        console.log('[v0] Document saved:', doc.id)
      } else {
        console.error('[v0] Error saving document metadata:', docError)
      }
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
      document: uploadedDocs[0], // Return first for single uploads
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
