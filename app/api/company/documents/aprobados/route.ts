export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/aprobados
 * Returns approved documents for both conductors and subcontractors
 * FIXED: Using correct field names from the actual database schema
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

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
    console.log('[v0] Aprobados endpoint: Fetching ALL approved documents')

    // Get approved conductor documents - NO FILTER, fetch all
    const { data: conductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        original_filename,
        document_type_id,
        validation_status,
        file_url,
        validated_at,
        ejecutiva,
        created_at,
        updated_at,
        conductor_id,
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .eq('validation_status', 'approved')
      .order('updated_at', { ascending: false })

    if (conductorError) {
      console.error('[v0] Aprobados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    console.log('[v0] Aprobados: Conductor docs count:', conductorDocs?.length || 0)

    // Get assigned executives for conductors
    // Workflow: conductores.rut_proveedor -> transportistas.rut -> transportistas.assigned_executive_id -> executive_staff.full_name
    let conductorExecutiveMap = new Map<string, string>()
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
          .select('rut, assigned_executive_id')
          .in('rut', transportistaRuts)

        if (transportistas && transportistas.length > 0) {
          const executiveIds = transportistas
            .map(t => t.assigned_executive_id)
            .filter(Boolean) as string[]

          if (executiveIds.length > 0) {
            // Get executive names
            const { data: executives } = await supabase
              .from('executive_staff')
              .select('id, full_name')
              .in('id', executiveIds)

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

    console.log('[v0] Aprobados: Conductor executive map:', Array.from(conductorExecutiveMap.entries()))

    // Get approved subcontractor documents - NO FILTER, fetch all
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select(`
        id,
        file_name,
        document_type_id,
        status,
        file_url,
        reviewed_by_ejecutiva,
        created_at,
        updated_at,
        subcontractor_id,
        subcontractor_rut,
        transportistas:subcontractor_id (
          id,
          razon_social,
          rut
        )
      `)
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })

    if (subError) {
      console.error('[v0] Aprobados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
    }

    console.log('[v0] Aprobados: Sub docs count:', subDocs?.length || 0)
    if (subDocs && subDocs.length > 0) {
      console.log('[v0] Aprobados: First sub doc:', JSON.stringify(subDocs[0], null, 2))
    }

    // Fetch document types
    const { data: docTypes } = await supabase
      .from("subcontractor_document_types")
      .select("id, code, nombre")

    const docTypeMap = new Map(docTypes?.map(dt => [dt.id, { code: dt.code, nombre: dt.nombre }]) || [])

    // Get assigned executives for subcontractors
    // Workflow: subcontractor_id -> transportistas.id -> transportistas.assigned_executive_id -> executive_staff.full_name
    let executiveMap = new Map<string, string>()
    if (subDocs && subDocs.length > 0) {
      const subcontractorIds = [...new Set((subDocs as any[]).map(doc => doc.subcontractor_id))]
      console.log('[v0] Aprobados: Getting executives for subcontractors:', subcontractorIds)
      
      // Get transportistas with their assigned executives
      const { data: transportistas, error: transError } = await supabase
        .from('transportistas')
        .select('id, assigned_executive_id')
        .in('id', subcontractorIds)

      console.log('[v0] Aprobados: Transportistas found:', transportistas?.length, 'Error:', transError)

      if (transportistas && transportistas.length > 0) {
        const executiveIds = transportistas
          .map(t => t.assigned_executive_id)
          .filter(Boolean) as string[]

        if (executiveIds.length > 0) {
          // Get executive names
          const { data: executives, error: execError } = await supabase
            .from('executive_staff')
            .select('id, full_name')
            .in('id', executiveIds)

          console.log('[v0] Aprobados: Executives found:', executives?.length, 'Error:', execError)

          if (executives) {
            const execMap = new Map(executives.map(e => [e.id, e.full_name]))
            // Map subcontractor_id -> executive_name
            transportistas.forEach((t: any) => {
              if (t.assigned_executive_id) {
                const execName = execMap.get(t.assigned_executive_id)
                if (execName) {
                  executiveMap.set(t.id, execName)
                  console.log('[v0] Aprobados: Mapped subcontractor', t.id, 'to executive', execName)
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
        validated_at: doc.validated_at || doc.updated_at,
        ejecutiva: assignedEjecutiva,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.validated_at || doc.updated_at,
        conductores: doc.conductores,
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
        approved_at: doc.approved_at || doc.updated_at,
        approved_by_email: doc.approved_by_email,
        reviewed_by_ejecutiva: assignedEjecutiva,
        ejecutiva: assignedEjecutiva, // Use assigned ejecutiva for filtering
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.approved_at || doc.updated_at,
        transportistas: doc.transportistas || {
          id: doc.subcontractor_id,
          razon_social: 'Subcontratista',
          rut: doc.subcontractor_rut
        },
        docType: docTypeMap.get(doc.document_type_id),
        document_source: 'subcontractor'
      }
    })

    const allDocs = [...normalizedConductor, ...normalizedSub]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    console.log('[v0] Aprobados endpoint: Returning', allDocs.length, 'approved documents')

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
    console.error('[v0] Aprobados endpoint: Caught error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[v0] Error stack:', errorStack)
    
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
