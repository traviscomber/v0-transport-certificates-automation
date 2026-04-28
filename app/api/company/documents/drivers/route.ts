import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverRut = searchParams.get('driver_rut') || searchParams.get('rut')

    if (!driverRut) {
      return NextResponse.json({ error: 'driver_rut required' }, { status: 400 })
    }

    console.log('[v0] Fetching documents for driver_rut:', driverRut, 'Type:', typeof driverRut, 'Length:', driverRut?.length)
    // Log raw request URL to see encoding
    console.log('[v0] Request URL:', request.url)
    console.log('[v0] All search params:', Array.from(searchParams.entries()))

    const adminClient = await createAdminClient()

    // Try exact match first, then fallback to ILIKE for partial matches
    let conductorRow = null
    let conductorError = null

    // First try exact match
    const exactResult = await adminClient
      .from('conductores')
      .select('id')
      .eq('rut', driverRut)
      .single()

    if (!exactResult.error && exactResult.data) {
      conductorRow = exactResult.data
    } else {
      // Fallback to ILIKE for flexible matching (handles formatting differences)
      const flexResult = await adminClient
        .from('conductores')
        .select('id')
        .ilike('rut', `%${driverRut}%`)
        .limit(1)
        .single()

      if (!flexResult.error && flexResult.data) {
        conductorRow = flexResult.data
      } else {
        conductorError = flexResult.error
      }
    }

    if (conductorError || !conductorRow?.id) {
      console.log('[v0] Conductor not found for RUT:', driverRut)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    const conductorId = conductorRow.id
    console.log('[v0] Resolved conductor_id:', conductorId)

    const { data: dbDocuments, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select('id, original_filename, document_type_id, file_url, validation_status, created_at, expiration_date')
      .eq('conductor_id', conductorId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying uploaded_documents:', dbError.message)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    console.log('[v0] Found documents:', dbDocuments?.length || 0)

    const documents = (dbDocuments || []).map((doc: any) => {
      // Map validation_status to Spanish status
      let estadoEspanol = 'pendiente'
      if (doc.validation_status) {
        const s = doc.validation_status.toLowerCase()
        if (s === 'validated') estadoEspanol = 'aprobado'
        else if (s === 'rejected') estadoEspanol = 'rechazado'
        else if (s === 'pending') estadoEspanol = 'pendiente'
      }

      return {
        id: doc.id,
        file_name: doc.original_filename,
        original_filename: doc.original_filename,
        upload_date: doc.created_at,
        created_at: doc.created_at,
        document_type: doc.document_type_id || 'Documento',
        verification_status: estadoEspanol,
        validation_status: doc.validation_status,
        expiration_date: doc.expiration_date || null,
        size: 0,
        storage_path: '',
        public_url: doc.file_url || '',
      }
    })

    return NextResponse.json({ success: true, driver_rut: driverRut, documents }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/drivers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching documents' },
      { status: 500 }
    )
  }
}
