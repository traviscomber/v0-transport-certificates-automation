import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Accept driver_id (UUID) directly from the driver object
    let conductorId = searchParams.get('driver_id')
    const driverRut = searchParams.get('driver_rut') || searchParams.get('rut')

    // If no driver_id but have RUT, look it up
    if (!conductorId && driverRut) {
      console.log('[v0] Looking up conductor UUID for RUT:', driverRut)
      
      const exactResult = await (await createAdminClient())
        .from('conductores')
        .select('id')
        .eq('rut', driverRut)
        .single()

      if (exactResult.data?.id) {
        conductorId = exactResult.data.id
      } else {
        // Fallback to flexible matching
        const flexResult = await (await createAdminClient())
          .from('conductores')
          .select('id')
          .ilike('rut', `%${driverRut}%`)
          .limit(1)
          .single()

        if (flexResult.data?.id) {
          conductorId = flexResult.data.id
        }
      }
    }

    if (!conductorId) {
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    const adminClient = await createAdminClient()

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

    return NextResponse.json({ success: true, driver_id: conductorId, documents }, {
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
