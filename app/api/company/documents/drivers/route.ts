import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    // Buscar conductores para obtener el ID
    const { data: drivers } = await adminClient
      .from('conductores')
      .select('id, rut')
      .like('rut', `%${rut}%`)
      .limit(1)
    
    // Si no encuentra en conductores, buscar en datos locales
    let driverId = null
    if (drivers && drivers.length > 0) {
      driverId = drivers[0].id
    } else {
      // Fallback a datos locales
      const { allDriversData } = await import('@/lib/data/all-drivers')
      const normalizeRUT = (rutVal: string | undefined) => {
        if (!rutVal) return ''
        return rutVal.trim().replace(/[.-]/g, '').toUpperCase()
      }
      const normalizedSearch = normalizeRUT(rut)
      const localDriver = allDriversData.find(d => normalizeRUT(d.rut) === normalizedSearch)
      if (localDriver) {
        driverId = localDriver.id || `local_${localDriver.rut}`
      }
    }

    if (!driverId) {
      console.warn('[v0] Driver not found for RUT:', rut)
      return NextResponse.json({
        success: true,
        driver_rut: rut,
        documents: []
      })
    }

    console.log('[v0] Found driver ID:', driverId)

    // Buscar documentos en tabla desde la base de datos
    const { data: dbDocuments, error: dbError } = await adminClient
      .from('driver_documents')
      .select('id, file_name, document_type, file_url, created_at, status')
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
      
      // Si file_url no existe o está vacía, intentar construirla desde el storage path
      if (!publicUrl || publicUrl.trim() === '') {
        try {
          // Obtener la URL pública desde Supabase Storage
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          if (supabaseUrl && doc.file_url) {
            // Construir la URL correctamente
            publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_url}`
            console.log('[v0] Generated public URL:', publicUrl)
          }
        } catch (urlError) {
          console.warn('[v0] Could not generate public URL:', urlError)
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

    console.log('[v0] Found', documents.length, 'documents for driver:', rut)

    return NextResponse.json({
      success: true,
      driver_rut: rut,
      documents: documents,
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/drivers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching documents' },
      { status: 500 }
    )
  }
}
