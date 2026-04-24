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

    console.log('[v0] Fetching documents for driver RUT:', rut)

    const adminClient = createAdminClient()

    // Get all documents for this driver RUT via transportistas table
    const { data: transportistas, error } = await adminClient
      .from('transportistas')
      .select('document_id, uploaded_documents(id, file_name, file_size, file_type, document_type, upload_date, created_at)')
      .eq('rut', rut)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching transportistas:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    // Extract documents from the relationship
    const documents = transportistas
      ?.map((t: any) => t.uploaded_documents)
      .filter(Boolean) || []

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
