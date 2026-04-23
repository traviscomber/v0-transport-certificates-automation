'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const driverId = formData.get('driverId') as string
    const category = formData.get('category') as string

    console.log('[v0] Driver document upload:', { driverId, category, fileCount: files.length })

    if (!driverId || !files.length) {
      return NextResponse.json(
        { error: 'Driver ID and files required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

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
      const fileName = `${Date.now()}_${file.name}`
      const filePath = `drivers/${driverId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await adminClient.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('[v0] Upload error:', uploadError)
        continue
      }

      // Get signed URL
      const { data: { publicUrl } } = adminClient.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Save metadata to documents table
      const { data: doc, error: docError } = await adminClient
        .from('documents')
        .insert({
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          document_type: category,
          driver_id: driverId,
          storage_path: filePath,
          public_url: publicUrl,
        })
        .select()
        .single()

      if (!docError && doc) {
        uploadedDocs.push(doc)
        console.log('[v0] Document saved:', doc.id)
      }
    }

    console.log('[v0] Upload complete:', uploadedDocs.length, 'documents')

    return NextResponse.json({
      success: true,
      message: `${uploadedDocs.length} document(s) uploaded successfully`,
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
