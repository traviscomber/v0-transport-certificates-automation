export const dynamic = 'force-dynamic'
export const revalidate = 0
/**
 * GET /api/company/documents/rechazados
 * Returns rejected documents for both conductors and subcontractors
 * FIXED: Using correct field names from the actual database schema
 * Last updated: 2026-05-13 - Added revalidate=0 for fresh data
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('[v0] Rechazados endpoint: Auth error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[v0] Rechazados endpoint: User:', user.email)

    // Get current user's role and executive info
    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('cargo, email')
      .eq('email', user.email)
      .single()

    if (roleError || !userRole) {
      console.error('[v0] Rechazados endpoint: Role error:', roleError)
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 403 }
      )
    }

    console.log('[v0] Rechazados endpoint: User cargo:', userRole.cargo)

    // Get executive info if user is an executive
    let executiveId: string | null = null
    let executiveName: string | null = null
    
    if (userRole.cargo === 'EJECUTIVA' || userRole.cargo === 'ejecutiva') {
      const { data: execData, error: execError } = await supabase
        .from('executive_staff')
        .select('id, full_name, email')
        .eq('email', user.email)
        .single()

      if (!execError && execData) {
        executiveId = execData.id
        executiveName = execData.full_name
        console.log('[v0] Rechazados endpoint: Executive:', executiveName)
      }
    }

    // If user is not an executive, return empty list
    if (!executiveId) {
      console.log('[v0] Rechazados endpoint: User is not an executive')
      return NextResponse.json({
        documents: [],
        executiva: 'No especificado',
        total: 0
      })
    }

    console.log('[v0] Rechazados endpoint: Fetching rejected documents for executive:', executiveId)

    // Get rejected conductor documents - filter by current executive
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
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .eq('validation_status', 'rejected')
      .eq('ejecutiva', executiveName)
      .order('updated_at', { ascending: false })

    console.log('[v0] Rechazados: Conductor docs result -', conductorDocs?.length || 0, 'docs,', conductorError ? 'ERROR' : 'OK')
    
    if (conductorError) {
      console.error('[v0] Rechazados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    // Get rejected subcontractor documents with assigned ejecutiva
    // First, get subcontractors assigned to this executive
    const { data: assignedTransportistas, error: transpError } = await supabase
      .from('transportistas')
      .select('id')
      .eq('assigned_executive_id', executiveId)

    if (transpError) {
      console.error('[v0] Rechazados endpoint: Error fetching assigned transportistas:', transpError)
    }

    const assignedTransportistaIds = assignedTransportistas?.map(t => t.id) || []
    console.log('[v0] Rechazados: Assigned transportistas count:', assignedTransportistaIds.length)

    // Get rejected subcontractor documents - filter by assigned transportistas
    let subDocsQuery = supabase
      .from('subcontractor_documents')
      .select(`
        id,
        file_name,
        document_type_id,
        status,
        file_url,
        rejection_reason,
        approved_at,
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
      .eq('status', 'rejected')

    // Filter by assigned subcontractors if there are any
    if (assignedTransportistaIds.length > 0) {
      subDocsQuery = subDocsQuery.in('subcontractor_id', assignedTransportistaIds)
    } else {
      // If no assigned subcontractors, return empty list
      subDocsQuery = subDocsQuery.eq('subcontractor_id', 'null-no-match')
    }

    const { data: subDocs, error: subError } = await subDocsQuery
      .order('updated_at', { ascending: false })

    console.log('[v0] Rechazados: Sub docs result -', subDocs?.length || 0, 'docs,', subError ? 'ERROR' : 'OK')
    
    if (subError) {
      console.error('[v0] Rechazados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
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
      const { data: executives, error: execError } = await supabase
        .from('executive_staff')
        .select('transportista_id, full_name, email')
        .in('transportista_id', subcontractorIds)
        .eq('is_active', true)

      if (!execError && executives) {
        executives.forEach((exec: any) => {
          executiveMap.set(exec.transportista_id, exec.full_name || exec.email)
        })
      }
    }

    // Normalize data to match component expectations - keep nested objects intact
    const normalizedConductor = (conductorDocs || []).map((doc: any) => {
      // Determine file type from file extension
      const fileExtension = doc.original_filename?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
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
        ejecutiva: doc.ejecutiva || 'No especificado',
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
        rejection_reason: doc.rejection_reason,
        approved_at: doc.approved_at || doc.updated_at,
        reviewed_by_ejecutiva: assignedEjecutiva,
        ejecutiva: assignedEjecutiva, // Use assigned ejecutiva for filtering
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.approved_at || doc.updated_at,
        // Use transportistas from relationship if available
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

    console.log('[v0] Rechazados endpoint: Returning', allDocs.length, 'rejected documents')

    return NextResponse.json({
      conductorDocs: normalizedConductor,
      subDocs: normalizedSub,
      allDocs: allDocs,
      documents: allDocs,
      executiva: executiveName,
      executiva_id: executiveId,
      total: allDocs.length,
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
