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

    const driverId = String(driver.id)

    const adminClient = await createAdminClient()

    const { data: dbDocuments, error: dbError } = await adminClient
      .from('driver_documents')
      .select('id, file_name, document_type, file_url, uploaded_at, created_at, status')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying documents:', dbError.message)
    }

    // Fetch document statuses
    let statusMap: Record<string, any> = {}
    try {
      const { data: statuses } = await adminClient
        .from('document_statuses')
        .select('document_id, status, reason, changed_at')
      if (statuses) {
        statusMap = Object.fromEntries(statuses.map(s => [s.document_id, s]))
      }
    } catch {}

    const documents = (dbDocuments || []).map(doc => {
      const docStatus = statusMap[doc.id]
      let estadoEspanol = 'pendiente'

      if (docStatus?.status) {
        const s = docStatus.status.toLowerCase()
        if (s === 'approved') estadoEspanol = 'aprobado'
        else if (s === 'rejected') estadoEspanol = 'rechazado'
        else if (s === 'pending') estadoEspanol = 'pendiente'
        else if (s === 'expired') estadoEspanol = 'vencido'
      } else if (doc.status) {
        const s = doc.status.toLowerCase()
        if (s === 'aprobado') estadoEspanol = 'aprobado'
        else if (s === 'rechazado') estadoEspanol = 'rechazado'
        else if (s === 'pendiente') estadoEspanol = 'pendiente'
      }

      let publicUrl = doc.file_url || ''
      if (doc.file_url && !doc.file_url.startsWith('http')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_url}`
        }
      }

      return {
        id: doc.id,
        file_name: doc.file_name,
        upload_date: doc.uploaded_at || doc.created_at,
        document_type: doc.document_type || 'Documento',
        verification_status: estadoEspanol,
        size: 0,
        storage_path: doc.file_url || '',
        public_url: publicUrl,
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
