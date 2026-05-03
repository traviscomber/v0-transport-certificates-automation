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

    // Normalize RUT — try exact, then without dash, then with dash
    const rutClean = driverRut.replace(/-/g, '').trim()
    const rutWithDash = rutClean.length > 1
      ? `${rutClean.slice(0, -1)}-${rutClean.slice(-1)}`
      : driverRut

    console.log('[v0] RUT variants - original:', driverRut, 'clean:', rutClean, 'withDash:', rutWithDash)

    // Try to find conductor with any RUT format - try each variant individually
    let conductorData = null
    let conductorError = null

    // Try exact match first
    let result = await adminClient
      .from('conductores')
      .select('id, rut')
      .eq('rut', driverRut)
      .limit(1)
      .single()
    
    if (result.data) {
      conductorData = result.data
      console.log('[v0] Found conductor by exact RUT match:', driverRut)
    } else {
      // Try clean RUT (no dashes)
      result = await adminClient
        .from('conductores')
        .select('id, rut')
        .eq('rut', rutClean)
        .limit(1)
        .single()
      
      if (result.data) {
        conductorData = result.data
        console.log('[v0] Found conductor by clean RUT:', rutClean)
      } else {
        // Try with dash format
        result = await adminClient
          .from('conductores')
          .select('id, rut')
          .eq('rut', rutWithDash)
          .limit(1)
          .single()
        
        if (result.data) {
          conductorData = result.data
          console.log('[v0] Found conductor by RUT with dash:', rutWithDash)
        } else {
          conductorError = result.error
        }
      }
    }

    console.log('[v0] Conductor lookup result:', { found: !!conductorData, error: conductorError?.message, conductorId: conductorData?.id })

    if (conductorError || !conductorData?.id) {
      // Last resort: try driver_id directly if provided
      if (driverId && driverId !== 'undefined') {
        console.log('[v0] Conductor not found by RUT, trying driver_id directly:', driverId)
        const { data: byId, error: byIdError } = await adminClient
          .from('uploaded_documents')
          .select('id, original_filename, document_type_id, file_url, validation_status, rejection_reason, created_at, expiration_date')
          .eq('conductor_id', driverId)
          .order('created_at', { ascending: false })
        
        console.log('[v0] Query by driver_id result:', { count: byId?.length || 0, error: byIdError?.message })
        
        if (byId && byId.length > 0) {
          console.log('[v0] Found', byId.length, 'documents by driver_id fallback')
          const statusMap: Record<string, string> = {
            'approved': 'aprobado', 'validated': 'aprobado', 'rejected': 'rechazado',
            'pending': 'pendiente', 'expired': 'vencido',
            'aprobado': 'aprobado', 'rechazado': 'rechazado', 'pendiente': 'pendiente', 'vencido': 'vencido',
          }
          const documents = byId.map((doc: any) => ({
            id: doc.id, file_name: doc.original_filename, original_filename: doc.original_filename,
            upload_date: doc.created_at, created_at: doc.created_at,
            document_type: doc.document_type_id || 'Documento',
            verification_status: statusMap[(doc.validation_status || 'pending').toLowerCase()] || 'pendiente',
            validation_status: doc.validation_status,
            rejection_reason: doc.rejection_reason || null,
            expiration_date: doc.expiration_date || null, size: 0, storage_path: '', public_url: doc.file_url || '',
          }))
          return NextResponse.json({ success: true, conductor_id: driverId, documents }, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0', 'Pragma': 'no-cache', 'Expires': '0' }
          })
        }
      }
      console.log('[v0] Conductor not found for RUT variants:', driverRut, rutClean, rutWithDash, 'error:', conductorError?.message)
      console.log('[v0] Falling back: returning empty documents list')
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    // Found conductor by RUT, now query documents
    console.log('[v0] Found conductor by RUT, querying documents for conductor_id:', conductorData.id)
    
    const conductorId = conductorData.id
    console.log('[v0] Resolved conductor_id:', conductorId, 'from RUT in DB:', conductorData.rut)

    const { data: dbDocuments, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select('id, original_filename, document_type_id, file_url, validation_status, rejection_reason, created_at, expiration_date')
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
        rejection_reason: doc.rejection_reason || null,
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
