import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type FocusMode = 'company' | 'conductor'

function getFocus(request: Request) {
  const url = new URL(request.url)
  const focusMode = url.searchParams.get('focus_mode')
  const focusId = url.searchParams.get('focus_id')

  if (focusMode !== 'company' && focusMode !== 'conductor') return null
  if (!focusId) return null

  return {
    mode: focusMode as FocusMode,
    id: focusId,
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const focus = getFocus(request)
    
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
        updated_at,
        document_period_month,
        document_period_year,
        document_period_start,
        conductor_id,
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut,
          rut_proveedor
        )
      `)
      .or('validation_status.eq.pending,validation_status.is.null')
      .limit(10000)
      .order("created_at", { ascending: false })

    // Get pending subcontractor documents - WITH PAGINATION to handle > 1000 records
    let allSubDocs: any[] = []
    let page = 0
    let hasMore = true
    const pageSize = 1000
    
    while (hasMore) {
      const start = page * pageSize
      const end = start + pageSize - 1
      
      const { data: subDocsPage, error: pageError } = await supabase
        .from("subcontractor_documents")
        .select(`
          id,
          file_name,
          document_type_id,
          status,
          file_url,
          created_at,
          updated_at,
          uploaded_at,
          subcontractor_id,
          subcontractor_rut,
          reviewed_by_ejecutiva,
          uploaded_by_ejecutiva,
          document_period_month,
          document_period_year,
          document_period_start
        `)
        .eq('status', 'pending')
        .range(start, end)
        .order("created_at", { ascending: false })
      
      if (pageError) {
        console.error('[v0] Pending: Error fetching page', page, ':', pageError)
        hasMore = false
      } else if (!subDocsPage || subDocsPage.length === 0) {
        hasMore = false
      } else {
        allSubDocs.push(...subDocsPage)
        if (subDocsPage.length < pageSize) {
          hasMore = false
        }
        page++
      }
    }
    
    const subDocsRaw = allSubDocs
    console.log('[v0] Pending: Sub docs count (total):', subDocsRaw?.length || 0, '(fetched in', page, 'pages)')

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    const { data: conductorDocTypes } = await supabase
      .from("document_types")
      .select("id, code, name")

    // Filter out deprecated types
    const deprecatedCodes = ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL']
    const activeDocTypes = docTypes?.filter(dt => !deprecatedCodes.includes(dt.code)) || []
    const docTypeMap = new Map(activeDocTypes.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])
    const conductorDocTypeMap = new Map(conductorDocTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.name }]) || [])

    // Get assigned executives for conductors
    // Workflow: conductor_id -> conductores.rut_proveedor -> transportistas.rut -> transportistas.assigned_executive_id -> executive_staff.full_name
    let conductorExecutiveMap = new Map<string, string>()
    let conductorCompanyIdMap = new Map<string, string>()
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
          .select('id, rut, assigned_executive_id')
          .in('rut', transportistaRuts)

        if (transportistas && transportistas.length > 0) {
          const transportistaByRut = new Map(transportistas.map((t: any) => [t.rut, t]))
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
                const transportista = transportistaByRut.get(cr.rut_proveedor)
                if (transportista && transportista.assigned_executive_id) {
                  const execName = execMap.get(transportista.assigned_executive_id)
                  if (execName) {
                    conductorExecutiveMap.set(cr.id, execName)
                  }
                }
                if (transportista?.id) {
                  conductorCompanyIdMap.set(cr.id, transportista.id)
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
      id: doc.id,
      original_filename: doc.original_filename,
      document_type_id: doc.document_type_id,
      validation_status: doc.validation_status,
      file_url: doc.file_url,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      document_period_month: doc.document_period_month,
      document_period_year: doc.document_period_year,
      document_period_start: doc.document_period_start,
      conductores: doc.conductores,
      document_name: doc.original_filename,
      file_name: doc.original_filename,
      status: doc.validation_status,
      uploaded_at: doc.created_at,
      docType: conductorDocTypeMap.get(doc.document_type_id) || null,
      ejecutiva: conductorExecutiveMap.get(doc.conductores?.id) || 'Sin asignar',
      company_id: conductorCompanyIdMap.get(doc.conductores?.id) || null,
      document_source: 'conductor'
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
        id: doc.id,
        file_name: doc.file_name,
        document_name: doc.file_name,
        document_type_id: doc.document_type_id,
        status: doc.status,
        file_url: doc.file_url,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        subcontractor_id: doc.subcontractor_id,
        subcontractor_rut: doc.subcontractor_rut,
        reviewed_by_ejecutiva: doc.reviewed_by_ejecutiva,
        uploaded_by_ejecutiva: doc.uploaded_by_ejecutiva,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        transportistas: transportistaMap.get(doc.subcontractor_id),
        docType: docTypeMap.get(doc.document_type_id),
        company_id: doc.subcontractor_id || null,
        ejecutiva: executiveMap.get(doc.subcontractor_id) || 'Sin asignar'
      })))
    }

    const filteredConductorDocs = focus
      ? normalizedConductorDocs.filter((doc: any) => {
          if (focus.mode === 'conductor') {
            return doc.conductores?.id === focus.id
          }
          return doc.company_id === focus.id
        })
      : normalizedConductorDocs

    const filteredSubDocs = focus
      ? normalizedSubDocs.filter((doc: any) => focus.mode === 'company' && doc.company_id === focus.id)
      : normalizedSubDocs

    return NextResponse.json({
      conductorDocs: filteredConductorDocs || [],
      subDocs: filteredSubDocs || [],
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
