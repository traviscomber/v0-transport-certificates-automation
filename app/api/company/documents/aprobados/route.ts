export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/aprobados
 * Returns approved documents for both conductors and subcontractors
 * FIXED: Fetch all conductor docs without pagination/join, then fetch subcontractor docs with pagination
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

    console.log('[v0] Aprobados endpoint: Current ejecutiva:', currentExecutiva)

    // Get ALL approved conductor documents with pagination (Supabase 1000 record limit)
    let allConductorDocs: any[] = []
    let conductorPageNum = 0
    let conductorHasMore = true
    const conductorPageSize = 1000
    
    while (conductorHasMore) {
      const start = conductorPageNum * conductorPageSize
      const end = start + conductorPageSize - 1
      
      const { data: conductorPageData, error: pageError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('validation_status', 'approved')
        .order('updated_at', { ascending: false })
        .range(start, end)
      
      if (pageError) {
        console.error('[v0] Aprobados: Conductor page error:', pageError)
        conductorHasMore = false
      } else if (!conductorPageData || conductorPageData.length === 0) {
        conductorHasMore = false
      } else {
        allConductorDocs.push(...conductorPageData)
        if (conductorPageData.length < conductorPageSize) {
          conductorHasMore = false
        }
        conductorPageNum++
      }
    }
    
    const conductorDocs = allConductorDocs
    console.log('[v0] Aprobados: Total conductor documents:', conductorDocs?.length || 0)

    // Fetch conductor details manually to avoid join failures
    let conductorMap = new Map<string, any>()
    if (conductorDocs && conductorDocs.length > 0) {
      const validConductorIds = (conductorDocs as any[])
        .map(doc => doc.conductor_id)
        .filter(Boolean)
      
      if (validConductorIds.length > 0) {
        const { data: conductores } = await supabase
          .from('conductores')
          .select('id, nombres, apellido_paterno, rut')
          .in('id', validConductorIds)
        
        if (conductores) {
          conductores.forEach(c => conductorMap.set(c.id, c))
        }
      }
    }

    // Get assigned executives AND empresa razon_social for conductors
    let conductorExecutiveMap = new Map<string, string>()
    let conductorEmpresaMap = new Map<string, string>() // conductor_id -> razon_social
    let conductorCompanyIdMap = new Map<string, string>() // conductor_id -> transportista.id
    if (conductorDocs && conductorDocs.length > 0) {
      const { data: conductorRuts } = await supabase
        .from('conductores')
        .select('id, rut_proveedor')
        .in('id', (conductorDocs as any[]).map(doc => doc.conductor_id))

      if (conductorRuts && conductorRuts.length > 0) {
        const transportistaRuts = conductorRuts.map(c => c.rut_proveedor).filter(Boolean)
        
        const { data: transportistas } = await supabase
          .from('transportistas')
          .select('id, rut, assigned_executive_id, razon_social')
          .in('rut', transportistaRuts)

        if (transportistas && transportistas.length > 0) {
          const transportistaByRut = new Map(transportistas.map((t: any) => [t.rut, t]))
          const executiveIds = transportistas
            .map(t => t.assigned_executive_id)
            .filter(Boolean) as string[]

          if (executiveIds.length > 0) {
            const { data: executives } = await supabase
              .from('executive_staff')
              .select('id, full_name')
              .in('id', executiveIds)

            if (executives) {
              const execMap = new Map(executives.map(e => [e.id, e.full_name]))
              conductorRuts.forEach(cr => {
                const transportista = transportistaByRut.get(cr.rut_proveedor)
                if (transportista) {
                  // Map empresa name
                  if (transportista.razon_social) {
                    conductorEmpresaMap.set(cr.id, transportista.razon_social)
                  }
                  if (transportista.id) {
                    conductorCompanyIdMap.set(cr.id, transportista.id)
                  }
                  // Map executive name
                  if (transportista.assigned_executive_id) {
                    const execName = execMap.get(transportista.assigned_executive_id)
                    if (execName) {
                      conductorExecutiveMap.set(cr.id, execName)
                    }
                  }
                }
              })
            }
          }
        }
      }
    }

    // Get ALL approved subcontractor documents with pagination (pagination needed here)
    let allSubDocs: any[] = []
    let subPage = 0
    let subHasMore = true
    const subPageSize = 1000
    
    while (subHasMore) {
      const start = subPage * subPageSize
      const end = start + subPageSize - 1
      
      const { data: subDocsPage, error: pageError } = await supabase
        .from('subcontractor_documents')
        .select('*')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .range(start, end)
      
      if (pageError) {
        console.error('[v0] Aprobados: Subcontractor page error:', pageError)
        subHasMore = false
      } else if (!subDocsPage || subDocsPage.length === 0) {
        subHasMore = false
      } else {
        allSubDocs.push(...subDocsPage)
        if (subDocsPage.length < subPageSize) {
          subHasMore = false
        }
        subPage++
      }
    }
    
    const subDocs = allSubDocs
    console.log('[v0] Aprobados: Fetched', subDocs?.length || 0, 'subcontractor documents in', subPage, 'pages')

    // Fetch transportistas manually
    let transportistasMap = new Map<string, any>()
    if (subDocs && subDocs.length > 0) {
      const validSubIds = (subDocs as any[])
        .map(doc => doc.subcontractor_id)
        .filter(Boolean)
      
      if (validSubIds.length > 0) {
        const { data: transportistas } = await supabase
          .from('transportistas')
          .select('id, razon_social, rut')
          .in('id', validSubIds)
        
        if (transportistas) {
          transportistas.forEach(t => transportistasMap.set(t.id, t))
        }
      }
    }

    // Fetch document types for subcontractors
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    // Filter out deprecated types
    const deprecatedCodes = ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL']
    const activeDocTypes = docTypes?.filter(dt => !deprecatedCodes.includes(dt.code)) || []
    const docTypeMap = new Map(activeDocTypes.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Fetch document types for conductors (document_types uses 'name')
    const { data: conductorDocTypes } = await supabase
      .from("document_types")
      .select("id, code, name")

    const conductorDocTypeMap = new Map(conductorDocTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.name }]) || [])

    // Get assigned executives for subcontractors
    let executiveMap = new Map<string, string>()    // transportista.id -> full_name
    let emailToNameMap = new Map<string, string>()  // any email variant -> full_name
    if (subDocs && subDocs.length > 0) {
      const subcontractorIds = [...new Set((subDocs as any[]).map(doc => doc.subcontractor_id))]
      
      const { data: transportistas } = await supabase
        .from('transportistas')
        .select('id, assigned_executive_id')
        .in('id', subcontractorIds)

      // Always fetch ALL executive_staff to build a complete email resolution map
      const { data: allExecutives } = await supabase
        .from('executive_staff')
        .select('id, full_name, email')

      if (allExecutives) {
        allExecutives.forEach((e: any) => {
          if (e.email) {
            // Map exact email
            emailToNameMap.set(e.email.toLowerCase(), e.full_name)
            // Map username prefix (before @) to handle mismatched email formats
            // e.g. "olga.carrasco@labbe.cl" -> "ocarrasco@labbe.cl" won't match
            // but we also try last-name prefix: "ocarrasco" -> find exec with apellido match
          }
        })

        // Build a smarter map: for each reviewed_by_ejecutiva email in the docs,
        // try to match against executive_staff by comparing the part before "@"
        // "ocarrasco" → find "Olga ... Carrasco" (surname starts with "Carrasc")
        // "csepulveda" → find "Carolina ... Sepulveda"
        const distinctReviewerEmails = [...new Set(
          (subDocs as any[]).map(d => d.reviewed_by_ejecutiva).filter(Boolean)
        )] as string[]

        for (const reviewerEmail of distinctReviewerEmails) {
          if (emailToNameMap.has(reviewerEmail.toLowerCase())) continue // already resolved

          const username = reviewerEmail.split('@')[0].toLowerCase() // "ocarrasco", "csepulveda"
          // Username format: first_initial + last_name (e.g. "o" + "carrasco", "c" + "sepulveda")
          const firstInitial = username[0]
          const lastNamePart = username.slice(1) // "carrasco", "sepulveda", "ayala", "silva"

          const matched = allExecutives.find((e: any) => {
            if (!e.full_name) return false
            const nameLower = e.full_name.toLowerCase()
            const firstNameMatch = nameLower.startsWith(firstInitial)
            const lastNameMatch = nameLower.includes(lastNamePart)
            return firstNameMatch && lastNameMatch
          })

          if (matched) {
            emailToNameMap.set(reviewerEmail.toLowerCase(), matched.full_name)
          }
        }

        if (transportistas) {
          const execMapById = new Map(allExecutives.map((e: any) => [e.id, e.full_name]))
          transportistas.forEach((t: any) => {
            if (t.assigned_executive_id) {
              const execName = execMapById.get(t.assigned_executive_id)
              if (execName) executiveMap.set(t.id, execName)
            }
          })
        }
      }
    }

    // Normalize conductor docs - keep only serializable fields
    const normalizedConductor = (conductorDocs || []).map((doc: any) => {
      const fileExtension = doc.original_filename?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      const assignedEjecutiva = conductorExecutiveMap.get(doc.conductor_id) || doc.ejecutiva || 'No especificado'
      const empresa_nombre = conductorEmpresaMap.get(doc.conductor_id) || null
      const conductor = conductorMap.get(doc.conductor_id) || null
      
      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_type_id: doc.document_type_id,
        docType: conductorDocTypeMap.get(doc.document_type_id) || null,
        validation_status: doc.validation_status,
        status: doc.validation_status,
        file_url: doc.file_url,
        file_type: file_type,
        validated_at: doc.validated_at || doc.updated_at,
        ejecutiva: assignedEjecutiva,
        empresa_nombre,
        conductores: conductor ? {
          id: conductor.id,
          nombres: conductor.nombres,
          apellido_paterno: conductor.apellido_paterno,
          rut: conductor.rut,
          rut_proveedor: conductor.rut_proveedor || null
        } : null,
        company_id: conductorCompanyIdMap.get(doc.conductor_id) || null,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        reviewed_at: doc.validated_at || doc.updated_at,
        document_source: 'conductor'
      }
    })

    // Normalize subcontractor docs - keep only serializable fields
    const normalizedSub = (subDocs || []).map((doc: any) => {
      const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      // Resolve ejecutiva: prefer executiveMap (full_name via assigned_executive_id),
      // then convert email fallback to full_name via emailToNameMap,
      // then raw reviewed_by_ejecutiva as last resort
      const rawFallback = doc.reviewed_by_ejecutiva || null
      const resolvedFallback = rawFallback ? (emailToNameMap.get(rawFallback) || rawFallback) : 'No especificado'
      const assignedEjecutiva = executiveMap.get(doc.subcontractor_id) || resolvedFallback
      const transportista = transportistasMap.get(doc.subcontractor_id)
      const empresa_nombre = transportista?.razon_social || null
      
      return {
        id: doc.id,
        document_name: doc.file_name,
        file_name: doc.file_name,
        original_filename: doc.file_name,
        document_type_id: doc.document_type_id,
        docType: docTypeMap.get(doc.document_type_id) || null,
        status: doc.status,
        file_url: doc.file_url,
        file_type: file_type,
        approved_at: doc.approved_at || doc.updated_at,
        reviewed_by_ejecutiva: assignedEjecutiva,
        ejecutiva: assignedEjecutiva,
        empresa_nombre,
        transportistas: transportista ? {
          id: transportista.id,
          razon_social: transportista.razon_social,
          rut: transportista.rut
        } : null,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        reviewed_at: doc.reviewed_at || doc.approved_at || doc.updated_at,
        subcontractor_id: doc.subcontractor_id,
        subcontractor_rut: doc.subcontractor_rut,
        company_id: doc.subcontractor_id || null,
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
          console.error('[v0] Error sorting docs:', e)
          return 0
        }
      })

    const filteredAllDocs = focus ? [...filteredConductor, ...filteredSub] : allDocs

    console.log('[v0] Aprobados endpoint: Returning', allDocs.length, 'total approved documents')

    return NextResponse.json({
      conductorDocs: filteredConductor,
      subDocs: filteredSub,
      allDocs: filteredAllDocs,
      documents: filteredAllDocs,
      currentExecutiva: currentExecutiva,
      total: filteredAllDocs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[v0] Aprobados endpoint error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        error: 'Failed to fetch approved documents',
        message: errorMessage,
        conductorDocs: [],
        subDocs: [],
        allDocs: [],
        total: 0,
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
