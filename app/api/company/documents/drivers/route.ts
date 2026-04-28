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
    const driverIdParam = searchParams.get('driver_id') || searchParams.get('id')
    const rutParam = searchParams.get('rut')

    if (!driverIdParam && !rutParam) {
      return NextResponse.json({ error: 'Driver ID or RUT required' }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    // Resolve the RUT: either from param or look up in allDriversData by static id
    let rut = rutParam
    if (!rut && driverIdParam) {
      const found = allDriversData.find(d => d.id === driverIdParam)
      rut = found?.rut || null
    }

    if (!rut) {
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    // Strip formatting from RUT (e.g. "12457226-6" -> "124572266") to match DB format
    const normalizedRut = normalizeRUT(rut)
    // Try exact match first, then partial
    const { data: conductorRow } = await adminClient
      .from('conductores')
      .select('id')
      .or(`rut.eq.${rut},rut.ilike.%${normalizedRut}%`)
      .limit(1)
      .single()

    if (!conductorRow?.id) {
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    const conductorId = conductorRow.id
    const { data: dbDocuments, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select('id, original_filename, document_type_id, file_url, file_path, created_at, validation_status, uploaded_by')
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
