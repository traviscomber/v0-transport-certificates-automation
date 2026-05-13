import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get pending conductor documents - REMOVED LIMIT to get ALL pending documents
    const { data: conductorDocs } = await supabase
      .from("uploaded_documents")
      .select(`
        id,
        original_filename,
        document_type_id,
        validation_status,
        file_url,
        created_at,
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .or('validation_status.eq.pending,validation_status.is.null')
      .order("created_at", { ascending: false })

    // Get pending subcontractor documents with ALL fields - REMOVED LIMIT to get ALL pending documents
    const { data: subDocsRaw } = await supabase
      .from("subcontractor_documents")
      .select(`
        id,
        file_name,
        document_type_id,
        status,
        file_url,
        created_at,
        uploaded_at,
        subcontractor_id,
        subcontractor_rut,
        reviewed_by_ejecutiva,
        uploaded_by_ejecutiva
      `)
      .eq('status', 'pending')
      .order("created_at", { ascending: false })

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    const docTypeMap = new Map(docTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Fetch transportistas for subcontractor documents with ejecutiva info
    let subDocs: any[] = []
    if (subDocsRaw && subDocsRaw.length > 0) {
      const { data: transportistas } = await supabase
        .from("transportistas")
        .select("id, razon_social, rut, ejecutivo_asignado, ejecutivo_nombre")
        .in("id", subDocsRaw.map(d => d.subcontractor_id))

      const transportistaMap = new Map(transportistas?.map(t => [t.id, t]) || [])

      subDocs = subDocsRaw.map(doc => {
        const transportista = transportistaMap.get(doc.subcontractor_id)
        
        // Priority: ejecutivo_nombre from transportista > reviewed_by > uploaded_by > Sin asignar
        const ejecutiva = transportista?.ejecutivo_nombre ||
                         doc.reviewed_by_ejecutiva ||
                         doc.uploaded_by_ejecutiva ||
                         'Sin asignar'
        
        return {
          ...doc,
          transportistas: transportista,
          docType: docTypeMap.get(doc.document_type_id),
          ejecutiva: ejecutiva
        }
      })
    }

    return NextResponse.json({
      conductorDocs: conductorDocs || [],
      subDocs: subDocs || [],
      success: true
    })
  } catch (error) {
    console.error('[v0] Error fetching pending documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending documents', success: false },
      { status: 500 }
    )
  }
}
