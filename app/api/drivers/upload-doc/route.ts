import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[v0] NEW UPLOAD ENDPOINT CALLED')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverRut = formData.get('driverRut') as string
    const documentType = formData.get('documentType') as string

    console.log('[v0] Upload params:', { driverRut, documentType, fileName: file?.name })

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    if (!driverRut) {
      return NextResponse.json({ error: 'No driver RUT' }, { status: 400 })
    }

    // Get admin client
    const adminClient = await createAdminClient()

    // 1. Get the driver ID from allDriversData (import at top of file)
    const { allDriversData } = await import('@/lib/data/all-drivers')
    const driver = allDriversData.find(d => d.rut === driverRut)
    
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    console.log('[v0] Found driver:', { rut: driver.rut, id: driver.id })

    // 2. Upload file to Supabase Storage
    const timestamp = Date.now()
    const fileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
    const filePath = `drivers/${driverRut}/${timestamp}_${fileName}`

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    console.log('[v0] File uploaded to storage:', filePath)

    // 3. Get public URL
    const { data: urlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl

    // 4. INSERT into database
    console.log('[v0] Inserting into database...')
    
    const { data: insertedDocs, error: insertError } = await adminClient
      .from('driver_documents')
      .insert([
        {
          driver_id: String(driver.id),
          file_name: file.name,
          document_type: documentType,
          file_url: publicUrl,
          status: 'pendiente',
        },
      ])
      .select()

    console.log('[v0] INSERT response:', {
      hasError: !!insertError,
      errorCode: insertError?.code,
      errorMessage: insertError?.message,
      dataType: typeof insertedDocs,
      isArray: Array.isArray(insertedDocs),
      length: Array.isArray(insertedDocs) ? insertedDocs.length : 'n/a',
      data: insertedDocs
    })

    if (insertError) {
      console.error('[v0] INSERT error:', insertError)
      return NextResponse.json({ error: 'Database insert failed', details: insertError }, { status: 500 })
    }

    console.log('[v0] ✅ Document inserted:', insertedDocs)

    return NextResponse.json({
      success: true,
      documents: insertedDocs || [],
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
