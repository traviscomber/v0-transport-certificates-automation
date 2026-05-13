'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerSubcontractorDocumentUploadedAlert } from '@/lib/operations/alert-triggers'

// Helper to trigger automatic AI analysis after upload
async function triggerAutoAnalysis(documentId: string) {
  try {
    console.log('[v0] Triggering automatic AI analysis for document:', documentId)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/company/documents/${documentId}/reprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('[v0] Auto-analysis completed:', result)
      return result
    } else {
      console.error('[v0] Auto-analysis failed with status:', response.status)
    }
  } catch (error) {
    console.error('[v0] Error triggering auto-analysis:', error)
  }
}

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
    const bucketName = 'subcontractor-documents'
    try {
      const { data: buckets } = await adminClient.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === bucketName)
      
      if (!bucketExists) {
        console.log('[v0] Creating', bucketName, 'bucket...')
        await adminClient.storage.createBucket(bucketName, {
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
      .from('transportistas')
      .select('id, rut, razon_social')
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

      console.log('[v0] Uploading file:', { fileName, size: file.size, type: file.type })

      // Convert File to Buffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log('[v0] File converted to buffer:', { bufferSize: buffer.length })

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await adminClient.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('[v0] Upload error:', uploadError.message)
        continue
      }

      console.log('[v0] Upload successful:', uploadData)

      // Get signed URL
      const { data: { publicUrl } } = adminClient.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      // Save metadata to subcontractor_documents table
      const { data: doc, error: docError } = await adminClient
        .from('subcontractor_documents')
        .insert({
          subcontractor_id: subcontractorId,
          subcontractor_rut: subcontractor.rut || '',
          document_type_id: category,
          file_url: publicUrl,
          file_name: file.name,
          status: 'pending',
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!docError && doc) {
        uploadedDocs.push(doc)
        console.log('[v0] Document saved:', doc.id)

        // Trigger automatic AI analysis (run in background, don't wait)
        triggerAutoAnalysis(doc.id).catch(err => console.error('[v0] Background auto-analysis error:', err))

        // Trigger alert for subcontractor document upload
        try {
          await triggerSubcontractorDocumentUploadedAlert(
            subcontractorId,
            file.name,
            subcontractor.razon_social,
            category,
            doc.id
          )
          console.log('[v0] Alert triggered for subcontractor doc upload')
        } catch (alertError) {
          console.error('[v0] Alert trigger error (non-fatal):', alertError)
        }
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
