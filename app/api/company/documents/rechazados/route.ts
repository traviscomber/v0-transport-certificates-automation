export const dynamic = 'force-dynamic'
export const revalidate = 0
/**
 * GET /api/company/documents/rechazados
 * Returns rejected documents for both conductors and subcontractors
 * FIXED: Using correct field names from the actual database schema
 * Last updated: 2026-05-13 - Added revalidate=0 for fresh data
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const supabase = createAdminClient()
    const focus = getFocus(request)

    // Get current user session to determine default filter
    let currentExecutiva: string | null = null
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: userRole } = await supabase
        .from('users')
        .select('cargo, email')
        .eq('email', user.email)
        .single()

      if (userRole?.cargo === 'EJECUTIVA' || userRole?.cargo === 'ejecutiva') {
        const { data: execData } = await supabase
          .from('executive_staff')
          .select('full_name')
          .eq('email', user.email)
          .single()
        
        if (execData) {
          currentExecutiva = execData.full_name
        }
      }
    }

    console.log('[v0] Rechazados endpoint: Current ejecutiva:', currentExecutiva)
    console.log('[v0] Rechazados endpoint: Fetching ALL rejected documents')

    // Get rejected conductor documents - NO FILTER, fetch all
    const { data: conductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        original_filename,
        document_type_id,
        validation_status,
        file_url,
        rejection_reason,
        validated_at,
        ejecutiva,
        created_at,
        updated_at,
        conductor_id,
        document_period_month,
        document_period_year,
        document_period_start,
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .eq('validation_status', 'rejected')
      .order('updated_at', { ascending: false })

    console.log('[v0] Rechazados: Conductor docs result -', conductorDocs?.length || 0, 'docs,', conductorError ? 'ERROR' : 'OK')
    
    if (conductorError) {
      console.error('[v0] Rechazados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    // Get rejected subcontractor documents - WITH PAGINATION (Supabase 1000 record limit)
    let allSubDocs: any[] = []
    let pageDex = 0
    let hasMoreSub = true
    let subError = null
    
    while (hasMoreSub) {
      const pageSize = 1000
      const start = pageDex * pageSize
      const end = start + pageSize - 1
      
      const { data: pageData, error: pageError } = await supabase
        .from('subcontractor_documents')
        .select(`
          id,
          file_name,
          document_type_id,
          status,
          file_url,
          rejection_reason,
          approved_at,
          reviewed_at,
          reviewed_by_ejecutiva,
          created_at,
          updated_at,
          uploaded_at,
          subcontractor_id,
          subcontractor_rut,
          document_period_month,
          document_period_year,
          document_period_start,
          transportistas:subcontractor_id (
            id,
            razon_social,
            rut
          )
        `)
        .eq('status', 'rejected')
        .range(start, end)
        .order('updated_at', { ascending: false })
      
      if (pageError) {
        console.error(`[v0] Rechazados: Error fetching page ${pageDex}:`, pageError.message)
        subError = pageError
        break
      }
      
      if (!pageData || pageData.length === 0) {
        hasMoreSub = false
      } else {
        allSubDocs = [...allSubDocs, ...pageData]
        console.log(`[v0] Rechazados: Page ${pageDex} fetched ${pageData.length} documents, total so far: ${allSubDocs.length}`)
        hasMoreSub = pageData.length === pageSize
        pageDex++
      }
    }
    
    const subDocs = allSubDocs
    console.log('[v0] Rechazados: Sub docs total count (all pages):', subDocs?.length || 0)
    
    if (subError) {
      console.error('[v0] Rechazados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
    }

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    // Filter out deprecated types
    const deprecatedCodes = ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL']
    const activeDocTypes = docTypes?.filter(dt => !deprecatedCodes.includes(dt.code)) || []
    const docTypeMap = new Map(activeDocTypes.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Get assigned executives for conductors
    // Workflow: conductor_id -> conductores.rut_proveedor -> transportistas.rut -> transportistas.assigned_executive_id -> executive_staff.full_name
    let conductorExecutiveMap = new Map<string, string>()
    let conductorCompanyIdMap = new Map<string, string>()
    if (conductorDocs && conductorDocs.length > 0) {
      // Get unique rut_proveedor from conductores
      const { data: conductorRuts } = await supabase
        .from('conductores')
        .select('id, rut_proveedor')
        .in('id', (conductorDocs as any[]).map(doc => doc.conductor_id))

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
    let executiveMap = new Map<string, string>()
    if (subDocs && subDocs.length > 0) {
      const subcontractorIds = [...new Set((subDocs as any[]).map(doc => doc.subcontractor_id))]
      console.log('[v0] Rechazados: Getting executives for subcontractors:', subcontractorIds.length, 'IDs')
      
      // Get transportistas with their assigned executives
      const { data: transportistas, error: transError } = await supabase
        .from('transportistas')
        .select('id, assigned_executive_id')
        .in('id', subcontractorIds)

      console.log('[v0] Rechazados: Transportistas query returned:', transportistas?.length || 0, 'records')

      if (transportistas && transportistas.length > 0) {
        const executiveIds = transportistas
          .map(t => t.assigned_executive_id)
          .filter(Boolean) as string[]

        if (executiveIds.length > 0) {
          // Get ALL executive names (not just filtered ones)
          const { data: executives } = await supabase
            .from('executive_staff')
            .select('id, full_name')

          console.log('[v0] Rechazados: ALL Executives found:', executives?.length)

          if (executives) {
            const execMap = new Map(executives.map(e => [e.id, e.full_name]))
            // Map subcontractor_id -> executive_name
            transportistas.forEach((t: any) => {
              if (t.assigned_executive_id) {
                const execName = execMap.get(t.assigned_executive_id)
                if (execName) {
                  executiveMap.set(t.id, execName)
                  console.log('[v0] Rechazados: Mapped transportista', t.id.substring(0, 8), 'to executive', execName)
                }
              }
            })
          }
        }
      }
    }


    // Normalize data to match component expectations - keep nested objects intact
    const normalizedConductor = (conductorDocs || []).map((doc: any) => {
      // Determine file type from file extension
      const fileExtension = doc.original_filename?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      // Get assigned ejecutiva from map, fallback to doc.ejecutiva or 'No especificado'
      const assignedEjecutiva = conductorExecutiveMap.get(doc.conductor_id) || doc.ejecutiva || 'No especificado'
      
      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_type_id: doc.document_type_id,
        validation_status: doc.validation_status,
        status: doc.validation_status, // For component compatibility
        file_url: doc.file_url,
        file_type: file_type, // Add calculated file_type
        rejection_reason: doc.rejection_reason,
        rejected_at: doc.validated_at || doc.updated_at,
        ejecutiva: assignedEjecutiva,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        reviewed_at: doc.validated_at || doc.updated_at,
        conductores: doc.conductores,
        company_id: conductorCompanyIdMap.get(doc.conductor_id) || null,
        docType: docTypeMap.get(doc.document_type_id),
        document_source: 'conductor'
      }
    })

    const normalizedSub = (subDocs || []).map((doc: any) => {
      // Determine file type from file extension
      const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      // Get assigned ejecutiva from executiveMap, fallback to reviewed_by_ejecutiva
      const assignedEjecutiva = executiveMap.get(doc.subcontractor_id) || doc.reviewed_by_ejecutiva || 'No especificado'
      
      return {
        id: doc.id,
        document_name: doc.file_name,
        file_name: doc.file_name,
        original_filename: doc.file_name,
        document_type_id: doc.document_type_id,
        status: doc.status,
        file_url: doc.file_url,
        file_type: file_type, // Add calculated file_type
        rejection_reason: doc.rejection_reason,
        approved_at: doc.approved_at || doc.updated_at,
        reviewed_by_ejecutiva: assignedEjecutiva,
        ejecutiva: assignedEjecutiva, // Use assigned ejecutiva for filtering
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        reviewed_at: doc.approved_at || doc.updated_at,
        // Use transportistas from relationship if available
        transportistas: doc.transportistas || {
          id: doc.subcontractor_id,
          razon_social: 'Subcontratista',
          rut: doc.subcontractor_rut
        },
        company_id: doc.subcontractor_id || null,
        docType: docTypeMap.get(doc.document_type_id),
        document_source: 'subcontractor'
      }
    })

    const filteredConductor = focus
      ? normalizedConductor.filter((doc: any) => {
          if (focus.mode === 'conductor') {
            return doc.conductores?.id === focus.id || doc.conductor_id === focus.id
          }
          return doc.company_id === focus.id
        })
      : normalizedConductor

    const filteredSub = focus
      ? normalizedSub.filter((doc: any) => focus.mode === 'company' && doc.company_id === focus.id)
      : normalizedSub

    const allDocs = [...normalizedConductor, ...normalizedSub]
      .sort((a, b) => {
        try {
          const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
          const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
          return dateB - dateA
        } catch (e) {
          console.error('[v0] Error sorting rejected docs:', e)
          return 0
        }
      })

    const filteredAllDocs = focus ? [...filteredConductor, ...filteredSub] : allDocs

    console.log('[v0] Rechazados endpoint: Returning', allDocs.length, 'rejected documents')

    return NextResponse.json({
      conductorDocs: filteredConductor,
      subDocs: filteredSub,
      allDocs: filteredAllDocs,
      documents: filteredAllDocs,
      currentExecutiva: currentExecutiva,
      total: filteredAllDocs.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('[v0] Rechazados endpoint: Caught error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[v0] Error stack:', errorStack)
    
    return NextResponse.json(
      { error: errorMessage, detail: 'Rechazados endpoint error' },
      { status: 500 }
    )
  }
}
