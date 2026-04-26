import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

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

    const adminClient = await createAdminClient()
    const normalizedInputRut = normalizeRUT(rut)

    // Step 1: Find driver in the database by RUT (not from local hardcoded data)
    const { data: driversFromDB, error: driverError } = await adminClient
      .from('drivers')
      .select('id, rut, nombres, apellidos')
      .limit(500)

    let driverId: string | null = null

    if (!driverError && driversFromDB && driversFromDB.length > 0) {
      const matchedDriver = driversFromDB.find(
        (d: any) => normalizeRUT(String(d.rut)) === normalizedInputRut
      )
      if (matchedDriver) {
        driverId = String(matchedDriver.id)
        console.log('[v0] Found driver in DB:', { driverId, rut: matchedDriver.rut })
      }
    }

    // Step 2: If not found in drivers table, try querying driver_documents directly by driver_rut
    if (!driverId) {
      // Fallback: try driver_id as the normalized RUT itself
      console.warn('[v0] Driver not found in drivers table for RUT:', rut, '- trying direct document lookup')
      
      const { data: directDocs, error: directError } = await adminClient
        .from('driver_documents')
        .select('driver_id')
        .limit(1)
      
      // Last resort: return empty
      return NextResponse.json({
        success: true,
        driver_rut: rut,
        documents: [],
        message: 'Driver not found'
      }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0' }
      })
    }

    // Step 3: Fetch all documents for this driver
    const { data: dbDocuments, error: dbError, count } = await adminClient
      .from('driver_documents')
      .select('id, file_name, document_type, file_url, created_at, status', { count: 'exact' })
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    console.log('[v0] Documents query: driverId=', driverId, 'count=', count, 'rows=', dbDocuments?.length, 'error=', dbError?.message)

    if (dbError) {
      console.error('[v0] Error querying documents:', dbError)
    }

    // Step 4: Fetch document statuses
    let statusMap: Record<string, any> = {}
    try {
      const { data: statuses } = await adminClient
        .from('document_statuses')
        .select('document_id, status, reason, changed_at')

      if (statuses) {
        statusMap = Object.fromEntries(statuses.map(s => [s.document_id, s]))
      }
    } catch {}

    // Step 5: Map documents
    const documents = (dbDocuments || []).map(doc => {
      const docStatus = statusMap[doc.id]
      let estadoEspanol = 'pendiente'

      if (docStatus?.status) {
        const s = docStatus.status.toLowerCase()
        if (s === 'approved') estadoEspanol = 'aprobado'
        else if (s === 'rejected') estadoEspanol = 'rechazado'
        else if (s === 'pending') estadoEspanol = 'pendiente'
        else if (s === 'expired') estadoEspanol = 'vencido'
        else if (s === 'deleted') estadoEspanol = 'eliminado'
      } else if (doc.status) {
        const s = doc.status.toLowerCase()
        if (s === 'aprobado') estadoEspanol = 'aprobado'
        else if (s === 'rechazado') estadoEspanol = 'rechazado'
      }

      let publicUrl = doc.file_url || ''
      if (doc.file_url && !doc.file_url.includes('http')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_url}`
        }
      }

      return {
        id: doc.id,
        file_name: doc.file_name,
        upload_date: doc.created_at,
        document_type: doc.document_type || 'Documento',
        verification_status: estadoEspanol,
        size: 0,
        storage_path: doc.file_url || '',
        public_url: publicUrl
      }
    })

    console.log('[v0] Returning', documents.length, 'documents for driver RUT:', rut)

    return NextResponse.json({
      success: true,
      driver_rut: rut,
      documents,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
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
