import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { allDriversData } from '@/lib/data/all-drivers'

export const dynamic = 'force-dynamic'

const normalizeRUT = (rut: string) => {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')

    if (!rut) {
      return NextResponse.json({ error: 'Driver RUT required' }, { status: 400 })
    }

    const normalizedInputRut = normalizeRUT(rut)

    // Find driver in allDriversData (source of truth for conductores)
    const driver = allDriversData.find(d => normalizeRUT(d.rut) === normalizedInputRut)

    if (!driver) {
      return NextResponse.json({ success: true, driver_rut: rut, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    const adminClient = await createAdminClient()

    // Query uploaded_documents table using conductor_id (which is the driver RUT)
    console.log('[v0] Querying uploaded_documents for conductor:', rut)
    const { data: dbDocuments, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select('id, original_filename, document_type_id, file_url, file_path, created_at, validation_status, uploaded_by')
      .eq('conductor_id', rut)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying uploaded_documents:', dbError.message)
      return NextResponse.json({ success: true, driver_rut: rut, documents: [] }, {
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
        uploaded_by: doc.uploaded_by || '',
        size: 0,
        storage_path: doc.file_path || '',
        public_url: doc.file_url || '',
      }
    })

    return NextResponse.json({ success: true, driver_rut: rut, documents }, {
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
