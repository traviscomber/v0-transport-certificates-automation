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
      .limit(10000)
      .order("created_at", { ascending: false })

    // Get pending subcontractor documents - MUST paginate due to Supabase 1000 record limit
    // Page 0 (0-999)
    const { data: subPage0 } = await supabase
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
      .range(0, 999)
      .order("created_at", { ascending: false })

    // Page 1 (1000-1999)
    const { data: subPage1 } = await supabase
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
      .range(1000, 1999)
      .order("created_at", { ascending: false })

    // Combine all pages
    const subDocsRaw = [...(subPage0 || []), ...(subPage1 || [])]

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    const docTypeMap = new Map(docTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Get assigned executives for conductors
    // Workflow: conductor_id -> conductores.rut_proveedor -> transportistas.rut -> transportistas.assigned_executive_id -> executive_staff.full_name
    let conductorExecutiveMap = new Map<string, string>()
    if (conductorDocs && conductorDocs.length > 0) {
      // Get unique rut_proveedor from conductores
      const { data: conductorRuts } = await supabase
        .from('conductores')
        .select('id, rut_proveedor')
        .in('id', (conductorDocs as any[]).map(doc => doc.conductores?.id).filter(Boolean))

      if (conductorRuts && conductorRuts.length > 0) {
        const transportistaRuts = conductorRuts.map(c => c.rut_proveedor).filter(Boolean)
        
        // Get transportistas with their assigned executives
        const { data: transportistas } = await supabase
          .from('transportistas')
          .select('rut, assigned_executive_id')
          .in('rut', transportistaRuts)

        if (transportistas && transportistas.length > 0) {
          const executiveIds = transportistas
            .map(t => t.assigned_executive_id)
            .filter(Boolean) as string[]

          if (executiveIds.length > 0) {
            // Get ALL executive names
            const { data: executives } = await supabase
              .from('executive_staff')
              .select('id, full_name')

            if (executives) {
              const execMap = new Map(executives.map(e => [e.id, e.full_name]))
              // Map conductor_id -> executive_name
              conductorRuts.forEach(cr => {
                const transportista = transportistas.find(t => t.rut === cr.rut_proveedor)
                if (transportista && transportista.assigned_executive_id) {
                  const execName = execMap.get(transportista.assigned_executive_id)
                  if (execName) {
                    conductorExecutiveMap.set(cr.id, execName)
                  }
                }
              })
            }
          }
        }
      }
    }

    // Get assigned executives for subcontractors
    // Workflow: subcontractor_id -> transportistas.id -> transportistas.assigned_executive_id -> executive_staff.full_name
    let executiveMap = new Map<string, string>()
    if (subDocsRaw && subDocsRaw.length > 0) {
      const subcontractorIds = [...new Set((subDocsRaw as any[]).map(doc => doc.subcontractor_id))]
      
      // Get transportistas with their assigned executives
      const { data: transportistas } = await supabase
        .from('transportistas')
        .select('id, assigned_executive_id')
        .in('id', subcontractorIds)

      if (transportistas && transportistas.length > 0) {
        const executiveIds = transportistas
          .map(t => t.assigned_executive_id)
          .filter(Boolean) as string[]

        if (executiveIds.length > 0) {
          // Get ALL executive names
          const { data: executives } = await supabase
            .from('executive_staff')
            .select('id, full_name')

          if (executives) {
            const execMap = new Map(executives.map(e => [e.id, e.full_name]))
            // Map subcontractor_id -> executive_name
            transportistas.forEach((t: any) => {
              if (t.assigned_executive_id) {
                const execName = execMap.get(t.assigned_executive_id)
                if (execName) {
                  executiveMap.set(t.id, execName)
                }
              }
            })
          }
        }
      }
    }

    // Normalize conductor documents with assigned executives
    const normalizedConductorDocs = (conductorDocs || []).map((doc: any) => ({
      ...doc,
      ejecutiva: conductorExecutiveMap.get(doc.conductores?.id) || 'Sin asignar'
    }))

    // Normalize subcontractor documents with assigned executives
    const normalizedSubDocs: any[] = []
    if (subDocsRaw && subDocsRaw.length > 0) {
      const { data: transportistas } = await supabase
        .from("transportistas")
        .select("id, razon_social, rut")
        .in("id", subDocsRaw.map(d => d.subcontractor_id))

      const transportistaMap = new Map(transportistas?.map(t => [t.id, t]) || [])

      normalizedSubDocs.push(...subDocsRaw.map(doc => ({
        ...doc,
        transportistas: transportistaMap.get(doc.subcontractor_id),
        docType: docTypeMap.get(doc.document_type_id),
        ejecutiva: executiveMap.get(doc.subcontractor_id) || 'Sin asignar'
      })))
    }

    return NextResponse.json({
      conductorDocs: normalizedConductorDocs || [],
      subDocs: normalizedSubDocs || [],
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
