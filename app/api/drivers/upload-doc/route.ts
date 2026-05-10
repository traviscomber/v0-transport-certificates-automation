import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { allDriversData } from '@/lib/data/all-drivers'

const normalizeRUT = (rut: string) => rut.replace(/[^0-9kK]/g, '').toUpperCase()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const driverRut = formData.get('driverRut') as string
    const documentType = formData.get('documentType') as string

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!driverRut) return NextResponse.json({ error: 'No driver RUT' }, { status: 400 })

    const normalizedInputRut = normalizeRUT(driverRut)

    // Find driver in allDriversData (source of truth for 291 conductores)
    const driver = allDriversData.find(d => normalizeRUT(d.rut) === normalizedInputRut)

    if (!driver) {
      console.error('[v0] Driver not found for RUT:', driverRut, 'normalized:', normalizedInputRut)
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    const driverId = String(driver.id)
    const adminClient = await createAdminClient()

    // 2. Upload file to Supabase Storage
    const timestamp = Date.now()
    const fileName = file.name.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
    const filePath = `drivers/${driverRut}/${timestamp}_${fileName}`

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(filePath, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('[v0] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // 3. Get public URL
    const { data: urlData } = adminClient.storage.from('documents').getPublicUrl(filePath)
    const publicUrl = urlData?.publicUrl

    // 4. INSERT into database
    const { data: insertedDocs, error: insertError } = await adminClient
      .from('driver_documents')
      .insert([{
        driver_id: driverId,
        file_name: file.name,
        document_type: documentType,
        file_url: publicUrl,
        status: 'pendiente',
      }])
      .select()

    if (insertError) {
      console.error('[v0] INSERT error:', insertError)
      return NextResponse.json({ error: 'Database insert failed', details: insertError }, { status: 500 })
    }

    console.log('[v0] Document inserted successfully, driverId:', driverId)

    return NextResponse.json({ success: true, documents: insertedDocs || [] })

  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
