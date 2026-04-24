'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const subcontractorId = formData.get('subcontractorId') as string
    const category = formData.get('category') as string
    const expiryDate = formData.get('expiryDate') as string | null

    console.log('[v0] Subcontractor document upload:', { subcontractorId, category, fileCount: files.length })

    if (!subcontractorId || !files.length) {
      return NextResponse.json(
        { error: 'Subcontractor ID and files required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Asegurar que el bucket existe
    try {
      const { data: buckets } = await adminClient.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === 'documents')
      
      if (!bucketExists) {
        console.log('[v0] Creating documents bucket...')
        await adminClient.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })
        console.log('[v0] Bucket created successfully')
      }
    } catch (bucketError) {
      console.log('[v0] Bucket check/create attempt (may already exist):', bucketError)
    }

    // Verify subcontractor exists
    const { data: subcontractor, error: subError } = await adminClient
      .from('subcontractors')
      .select('id, razon_social')
      .eq('id', subcontractorId)
      .single()

    if (subError || !subcontractor) {
      return NextResponse.json(
        { error: 'Subcontractor not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Found subcontractor:', subcontractor.razon_social)

    // Upload each file
    const uploadedDocs = []
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`
      const filePath = `subcontractors/${subcontractorId}/${fileName}`

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
          subcontractor_id: subcontractorId,
          storage_path: filePath,
          public_url: publicUrl,
          expiry_date: expiryDate || null,
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
    console.error('[v0] Error uploading subcontractor documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading documents' },
      { status: 500 }
    )
  }
}
