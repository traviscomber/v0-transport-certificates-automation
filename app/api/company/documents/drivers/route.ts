import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

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

    // Transformar archivos en formato de documento
    const documents = (files || []).map(file => ({
      id: file.id,
      file_name: file.name,
      upload_date: file.created_at,
      document_type: 'Documento',
      size: file.metadata?.size || 0
    }))

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
