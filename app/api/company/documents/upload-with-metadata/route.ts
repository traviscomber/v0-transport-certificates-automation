import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Parse FormData
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : 'Parse error'
      console.error('[v0] FormData parse failed:', msg)
      return NextResponse.json({ error: 'Failed to parse form data: ' + msg }, { status: 400 })
    }

    // Extract fields
    const file = formData.get('file') as File | null
    const driverRut = formData.get('driver_rut') as string | null
    const documentTypeId = formData.get('document_type_id') as string | null
    const metadataStr = formData.get('metadata') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!driverRut) {
      return NextResponse.json({ error: 'driver_rut is required' }, { status: 400 })
    }
    if (!documentTypeId) {
      return NextResponse.json({ error: 'document_type_id is required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of 50MB (received: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 413 }
      )
    }

    // Parse metadata (optional)
    let metadata: Record<string, any> = {}
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr)
      } catch {
        console.warn('[v0] Failed to parse metadata, using empty object')
      }
    }

    const adminClient = createAdminClient()

    // Resolve conductor UUID from RUT
    const { data: conductor, error: conductorError } = await adminClient
      .from('conductores')
      .select('id')
      .eq('rut', driverRut)
      .maybeSingle()

    if (conductorError) {
      console.error('[v0] Conductor lookup error:', conductorError)
      return NextResponse.json(
        { error: 'Database error looking up driver', details: conductorError.message },
        { status: 500 }
      )
    }

    if (!conductor?.id) {
      console.error('[v0] Conductor not found for RUT:', driverRut)
      return NextResponse.json(
        { error: `Conductor not found with RUT ${driverRut}` },
        { status: 404 }
      )
    }

    const conductorUUID = conductor.id
    console.log('[v0] Conductor found:', conductorUUID)

    // Upload file to Supabase Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `drivers/${conductorUUID}/${Date.now()}_${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('[v0] Uploading to storage:', storagePath, 'size:', buffer.length)

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    console.log('[v0] File uploaded to storage')

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(storagePath)

    const fileUrl = publicUrlData?.publicUrl || ''

    // Insert document record into uploaded_documents
    const insertPayload: Record<string, any> = {
      conductor_id: conductorUUID,
      document_type_id: documentTypeId,
      original_filename: file.name,
      file_url: fileUrl,
      validation_status: 'pending',
      ai_processing_status: 'pending',
    }

    // Add expiry_date if provided in metadata
    if (metadata.expiry_date) {
      insertPayload.extracted_expiration_date = metadata.expiry_date
    }

    console.log('[v0] Inserting document record')

    const { data: docRecord, error: dbError } = await adminClient
      .from('uploaded_documents')
      .insert([insertPayload])
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save document record', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('[v0] Document upload complete:', docRecord.id)

    return NextResponse.json({
      success: true,
      document: docRecord,
      message: 'Documento subido exitosamente',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : 'No stack'
    console.error('[v0] Upload endpoint FATAL ERROR:', msg)
    console.error('[v0] Stack:', stack)
    return NextResponse.json(
      { error: 'Internal server error: ' + msg, success: false },
      { status: 500 }
    )
  }
}
