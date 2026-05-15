import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/debug-document-status?rut=77113814-4
 * Debug endpoint to check document status in both tables
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rut = searchParams.get('rut')
    const docId = searchParams.get('id')

    if (!rut && !docId) {
      return NextResponse.json({
        error: 'Provide either rut= or id= query parameter',
        example: '/api/admin/debug-document-status?rut=77113814-4'
      }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    // Check conductor documents (uploaded_documents)
    let conductorDocs: any[] = []
    if (docId) {
      const { data } = await adminClient
        .from('uploaded_documents')
        .select(`
          id,
          original_filename,
          validation_status,
          approved_at,
          rejected_at,
          created_at,
          updated_at,
          conductor_id,
          conductores (
            id,
            rut,
            nombres,
            apellido_paterno
          )
        `)
        .eq('id', docId)

      if (data) {
        conductorDocs = Array.isArray(data) ? data : [data]
      }
    }

    // Check subcontractor documents (subcontractor_documents)
    let subDocs: any[] = []
    if (rut) {
      const { data } = await adminClient
        .from('subcontractor_documents')
        .select(`
          id,
          file_name,
          status,
          reviewed_at,
          created_at,
          updated_at,
          subcontractor_id,
          subcontractor_rut,
          transportistas (
            id,
            rut,
            razon_social
          )
        `)
        .eq('subcontractor_rut', rut)

      if (data) {
        subDocs = Array.isArray(data) ? data : [data]
      }
    } else if (docId) {
      // If we only have docId, try to find it in subcontractor_documents too
      const { data } = await adminClient
        .from('subcontractor_documents')
        .select(`
          id,
          file_name,
          status,
          reviewed_at,
          created_at,
          updated_at,
          subcontractor_id,
          subcontractor_rut,
          transportistas (
            id,
            rut,
            razon_social
          )
        `)
        .eq('id', docId)

      if (data) {
        subDocs = Array.isArray(data) ? data : [data]
      }
    }

    const response = {
      query_params: { rut, docId },
      conductor_documents: {
        count: conductorDocs.length,
        documents: conductorDocs.map(d => ({
          id: d.id,
          filename: d.original_filename,
          status: d.validation_status,
          conductor_rut: d.conductores?.rut,
          conductor_name: d.conductores ? `${d.conductores.nombres} ${d.conductores.apellido_paterno}` : null,
          approved_at: d.approved_at,
          rejected_at: d.rejected_at,
          updated_at: d.updated_at,
        }))
      },
      subcontractor_documents: {
        count: subDocs.length,
        documents: subDocs.map(d => ({
          id: d.id,
          filename: d.file_name,
          status: d.status,
          subcontractor_rut: d.subcontractor_rut,
          transportista_name: d.transportistas?.razon_social,
          reviewed_at: d.reviewed_at,
          updated_at: d.updated_at,
        }))
      },
      analysis: {
        total_documents_found: conductorDocs.length + subDocs.length,
        conductor_approved: conductorDocs.filter(d => d.validation_status === 'approved').length,
        subcontractor_approved: subDocs.filter(d => d.status === 'approved').length,
        all_approved: conductorDocs.filter(d => d.validation_status === 'approved').length + 
                       subDocs.filter(d => d.status === 'approved').length,
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Debug endpoint error:', msg)
    return NextResponse.json({ 
      error: msg,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
