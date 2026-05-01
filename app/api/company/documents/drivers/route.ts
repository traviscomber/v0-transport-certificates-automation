import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driver_id')
    const driverRut = searchParams.get('driver_rut')

    if (!driverRut) {
      console.log('[v0] Missing driver_rut parameter')
      return NextResponse.json({ error: 'driver_rut required' }, { status: 400 })
    }

    console.log('[v0] Fetching documents for driver_rut:', driverRut, 'driver_id:', driverId)

    const adminClient = await createAdminClient()

    // First, resolve the RUT to get the real conductor UUID
    const { data: conductorData, error: conductorError } = await adminClient
      .from('conductores')
      .select('id')
      .eq('rut', driverRut)
      .single()

    if (conductorError || !conductorData?.id) {
      console.log('[v0] Conductor not found for RUT:', driverRut)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    const conductorId = conductorData.id
    console.log('[v0] Resolved conductor_id from RUT:', conductorId)

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

    const statusMap: Record<string, string> = {
      'approved':  'aprobado',
      'validated': 'aprobado',
      'rejected':  'rechazado',
      'pending':   'pendiente',
      'expired':   'vencido',
      // legacy Spanish values already stored in DB
      'aprobado':  'aprobado',
      'rechazado': 'rechazado',
      'pendiente': 'pendiente',
      'vencido':   'vencido',
    }

    const documents = (dbDocuments || []).map((doc: any) => {
      const rawStatus = (doc.validation_status || 'pending').toLowerCase()
      const estadoEspanol = statusMap[rawStatus] || 'pendiente'

      return {
        id: doc.id,
        file_name: doc.original_filename,
        original_filename: doc.original_filename,
        upload_date: doc.created_at,
        created_at: doc.created_at,
        document_type: doc.document_type_id || 'Documento',
        // verification_status is the already-mapped Spanish value used by the hook
        verification_status: estadoEspanol,
        // keep raw value for debugging
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
