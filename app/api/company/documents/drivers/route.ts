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
      return NextResponse.json(
        { error: 'Driver RUT required' },
        { status: 400 }
      )
    }

    console.log('[v0] Listing documents for driver:', rut)

    const adminClient = await createAdminClient()

    // Normalizar el RUT de entrada
    const normalizedInputRut = normalizeRUT(rut)
    console.log('[v0] Normalized input RUT:', { input: rut, normalized: normalizedInputRut })

    // Buscar en la tabla conductores para obtener el driver_id correcto
    const { data: drivers, error: driverError } = await adminClient
      .from('conductores')
      .select('id, rut')
      .limit(1000)

    if (driverError) {
      console.error('[v0] Error fetching conductores:', driverError)
      return NextResponse.json(
        { error: 'Error fetching drivers' },
        { status: 500 }
      )
    }

    // Buscar coincidencia normalizando ambos lados
    let driverId = null
    for (const conductor of drivers || []) {
      const dbRutNormalized = normalizeRUT(conductor.rut)
      if (dbRutNormalized === normalizedInputRut) {
        driverId = conductor.id
        console.log('[v0] Found driver in conductores table:', { id: driverId, rut: conductor.rut })
        break
      }
    }

    if (!driverId) {
      console.warn('[v0] Driver not found for RUT:', rut)
      return NextResponse.json({
        success: true,
        driver_rut: rut,
        documents: [],
        message: 'Driver not found in system'
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    console.log('[v0] Using driver ID:', driverId)

    // Buscar documentos en tabla desde la base de datos
    // IMPORTANTE: usar preferCount=false para evitar cache
    const { data: dbDocuments, error: dbError, count } = await adminClient
      .from('driver_documents')
      .select('id, file_name, document_type, file_url, created_at, status', { count: 'exact' })
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying documents table:', dbError)
    }

    // Obtener estados de documentos de la tabla document_statuses
    let statusMap: Record<string, any> = {}
    try {
      const { data: statuses, error: statusError } = await adminClient
        .from('document_statuses')
        .select('document_id, status, reason, changed_at')

      if (!statusError && statuses) {
        statusMap = Object.fromEntries(
          statuses.map(s => [s.document_id, s])
        )
        console.log('[v0] Loaded', statuses.length, 'document statuses from DB')
      }
    } catch (statusFetchError) {
      console.warn('[v0] Could not fetch document statuses:', statusFetchError)
    }

    // Usar documentos de la base de datos si están disponibles
    const documents = (dbDocuments || []).map(doc => {
      // Primero, revisar si existe status en document_statuses
      const docStatus = statusMap[doc.id]
      let estadoEspanol = 'pendiente' // default
      
      if (docStatus?.status) {
        // Mapear desde document_statuses si existe
        const statusEN = docStatus.status.toLowerCase()
        if (statusEN === 'approved') estadoEspanol = 'aprobado'
        else if (statusEN === 'rejected') estadoEspanol = 'rechazado'
        else if (statusEN === 'pending') estadoEspanol = 'pendiente'
        else if (statusEN === 'expired') estadoEspanol = 'vencido'
        else if (statusEN === 'deleted') estadoEspanol = 'eliminado'
        console.log('[v0] Document', doc.id, 'has status from DB:', estadoEspanol)
      } else if (doc.status) {
        // Si no está en document_statuses, usar el status de driver_documents como fallback
        const statusLower = doc.status.toLowerCase()
        if (statusLower === 'aprobado') estadoEspanol = 'aprobado'
        else if (statusLower === 'rechazado') estadoEspanol = 'rechazado'
        console.log('[v0] Document', doc.id, 'using fallback status:', estadoEspanol)
      }
      
      // Generar URL pública correctamente
      let publicUrl = doc.file_url || ''
      
      console.log('[v0] Document URL check:', {
        docId: doc.id,
        rawFileUrl: doc.file_url,
        isEmpty: !doc.file_url || doc.file_url.trim() === '',
        isUrl: doc.file_url?.includes('http'),
      })
      
      // Si file_url es solo un path (no una URL completa), construirla
      if (doc.file_url && !doc.file_url.includes('http')) {
        // El file_url es solo el path, construir la URL completa
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_url}`
          console.log('[v0] Built full URL from path:', { path: doc.file_url, fullUrl: publicUrl })
        }
      } else if (!doc.file_url || doc.file_url.trim() === '') {
        // file_url está vacía completamente
        console.warn('[v0] Document has no file_url:', doc.id, doc.file_name)
      }
      
      console.log('[v0] Final public_url for document:', { docId: doc.id, publicUrl })
      
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

    console.log('[v0] Found', documents.length, 'documents for driver:', rut)

    return NextResponse.json({
      success: true,
      driver_rut: rut,
      documents: documents,
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
