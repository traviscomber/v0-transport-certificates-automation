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

    const adminClient = createAdminClient()

    // Listar archivos del storage con el patrón del RUT
    const { data: files, error } = await adminClient.storage
      .from('documents')
      .list(`drivers/${rut}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('[v0] Error listing files:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
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
        console.log('[v0] Loaded', statuses.length, 'document statuses')
      }
    } catch (dbError) {
      console.warn('[v0] Could not fetch document statuses:', dbError)
    }

    // Transformar archivos en formato de documento
    const documents = (files || [])
      .filter((file): file is typeof file & { id: string } => file.id !== null && file.id !== undefined)
      .map(file => {
        const status = statusMap[file.id]
        const verificationStatus = status ? status.status : 'pending'
        
        // Convertir estado a español para compatibilidad con UI
        let estadoEspanol = 'pendiente'
        if (verificationStatus === 'approved') estadoEspanol = 'aprobado'
        else if (verificationStatus === 'rejected') estadoEspanol = 'rechazado'
        
        // Generar URL pública del archivo
        const storagePath = `drivers/${rut}/${file.name}`
        const { data: publicUrlData } = adminClient.storage
          .from('documents')
          .getPublicUrl(storagePath)
        
        return {
          id: file.id,
          file_name: file.name,
          upload_date: file.created_at,
          document_type: 'Documento',
          verification_status: estadoEspanol,
          size: file.metadata?.size || 0,
          storage_path: storagePath,
          public_url: publicUrlData?.publicUrl || ''
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
