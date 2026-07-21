'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerSubcontractorDocumentUploadedAlert } from '@/lib/operations/alert-triggers'
import { normalizeDocumentPeriod } from '@/lib/document-period'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const subcontractorId = formData.get('subcontractorId') as string
    const category = formData.get('category') as string
    const expiryDate = formData.get('expiryDate') as string | null
    const periodMonth = formData.get('documentPeriodMonth') || formData.get('periodMonth')
    const periodYear = formData.get('documentPeriodYear') || formData.get('periodYear')
    const documentPeriod = normalizeDocumentPeriod(periodMonth as string | null, periodYear as string | null)

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

      const insertPayload = {
        subcontractor_id: subcontractorId,
        subcontractor_rut: subcontractor.rut || '',
        document_type_id: category,
        file_url: publicUrl,
        file_name: file.name,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
        ...(documentPeriod || {}),
      }

      let { data: doc, error: docError } = await adminClient
        .from('subcontractor_documents')
        .insert(insertPayload)
        .select()
        .single()

      if (docError && documentPeriod && /document_period/i.test(docError.message || '')) {
        return NextResponse.json(
          { error: 'La base de datos aun no tiene habilitado el periodo documental. Aplica la migracion 014 antes de subir documentos.' },
          { status: 503 }
        )
      }

      if (!docError && doc) {
        uploadedDocs.push(doc)
        console.log('[v0] Document saved:', doc.id)

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
