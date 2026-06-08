export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/aprobados
 * Returns approved documents for both conductors and subcontractors
 * FIXED: Fetch all conductor docs without pagination/join, then fetch subcontractor docs with pagination
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

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
        .select('id, original_filename, document_type_id, validation_status, file_url, validated_at, ejecutiva, created_at, updated_at, conductor_id')
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

    // Get assigned executives for conductors
    let conductorExecutiveMap = new Map<string, string>()
    if (conductorDocs && conductorDocs.length > 0) {
      const { data: conductorRuts } = await supabase
        .from('conductores')
        .select('id, rut_proveedor')
        .in('id', (conductorDocs as any[]).map(doc => doc.conductor_id))

      if (conductorRuts && conductorRuts.length > 0) {
        const transportistaRuts = conductorRuts.map(c => c.rut_proveedor).filter(Boolean)
        
        const { data: transportistas } = await supabase
          .from('transportistas')
          .select('rut, assigned_executive_id')
          .in('rut', transportistaRuts)

        if (transportistas && transportistas.length > 0) {
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
        .select('id, file_name, document_type_id, status, file_url, approved_at, approved_by_email, reviewed_by_ejecutiva, created_at, updated_at, subcontractor_id, subcontractor_rut')
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
    console.log('[v0] Aprobados: TOTAL =', (conductorDocs?.length || 0) + (subDocs?.length || 0), 'docs')

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

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    const docTypeMap = new Map(docTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Get assigned executives for subcontractors
    let executiveMap = new Map<string, string>()
    if (subDocs && subDocs.length > 0) {
      const subcontractorIds = [...new Set((subDocs as any[]).map(doc => doc.subcontractor_id))]
      
      const { data: transportistas } = await supabase
        .from('transportistas')
        .select('id, assigned_executive_id')
        .in('id', subcontractorIds)

      if (transportistas && transportistas.length > 0) {
        const executiveIds = transportistas
          .map(t => t.assigned_executive_id)
          .filter(Boolean) as string[]

        if (executiveIds.length > 0) {
          const { data: executives } = await supabase
            .from('executive_staff')
            .select('id, full_name')

          if (executives) {
            const execMap = new Map(executives.map(e => [e.id, e.full_name]))
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

    // Normalize conductor docs
    const normalizedConductor = (conductorDocs || []).map((doc: any) => {
      const fileExtension = doc.original_filename?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      const assignedEjecutiva = conductorExecutiveMap.get(doc.conductor_id) || doc.ejecutiva || 'No especificado'
      
      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_type_id: doc.document_type_id,
        validation_status: doc.validation_status,
        status: doc.validation_status,
        file_url: doc.file_url,
        file_type: file_type,
        validated_at: doc.validated_at || doc.updated_at,
        ejecutiva: assignedEjecutiva,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.validated_at || doc.updated_at,
        conductores: conductorMap.get(doc.conductor_id),
        docType: docTypeMap.get(doc.document_type_id),
        document_source: 'conductor'
      }
    })

    // Normalize subcontractor docs
    const normalizedSub = (subDocs || []).map((doc: any) => {
      const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
      const assignedEjecutiva = executiveMap.get(doc.subcontractor_id) || doc.reviewed_by_ejecutiva || 'No especificado'
      
      return {
        id: doc.id,
        document_name: doc.file_name,
        file_name: doc.file_name,
        original_filename: doc.file_name,
        document_type_id: doc.document_type_id,
        status: doc.status,
        file_url: doc.file_url,
        file_type: file_type,
        approved_at: doc.approved_at || doc.updated_at,
        approved_by_email: doc.approved_by_email,
        reviewed_by_ejecutiva: assignedEjecutiva,
        ejecutiva: assignedEjecutiva,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.approved_at || doc.updated_at,
        transportistas: transportistasMap.get(doc.subcontractor_id) || {
          id: doc.subcontractor_id,
          razon_social: 'Subcontratista',
          rut: doc.subcontractor_rut
        },
        docType: docTypeMap.get(doc.document_type_id),
        document_source: 'subcontractor'
      }
    })

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

    console.log('[v0] Aprobados endpoint: Returning', allDocs.length, 'total approved documents')

    return NextResponse.json({
      conductorDocs: normalizedConductor,
      subDocs: normalizedSub,
      allDocs: allDocs,
      documents: allDocs,
      currentExecutiva: currentExecutiva,
      total: allDocs.length,
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
