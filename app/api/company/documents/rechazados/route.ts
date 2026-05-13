export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/rechazados
 * Returns rejected documents for both conductors and subcontractors
 * FIXED: Using correct field names from the actual database schema
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    console.log('[v0] Rechazados endpoint: Fetching rejected documents')

    // Get rejected conductor documents - only 'rejected' (English)
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
      .order('updated_at', { ascending: false })

    console.log('[v0] Rechazados: Conductor docs result -', conductorDocs?.length || 0, 'docs,', conductorError ? 'ERROR' : 'OK')
    
    if (conductorError) {
      console.error('[v0] Rechazados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    // Get rejected subcontractor documents - use CORRECT field names and FK: subcontractor_id NOT transportista_id
    const { data: subDocs, error: subError } = await supabase
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
        subcontractor_rut
      `)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })

    console.log('[v0] Rechazados: Sub docs result -', subDocs?.length || 0, 'docs,', subError ? 'ERROR' : 'OK')
    
    if (subError) {
      console.error('[v0] Rechazados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
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
        validated_at: doc.validated_at || doc.updated_at,
        ejecutiva: doc.ejecutiva || 'No especificado',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.validated_at || doc.updated_at,
        conductores: doc.conductores,
        document_source: 'conductor'
      }
    })

    const normalizedSub = (subDocs || []).map((doc: any) => {
      // Determine file type from file extension
      const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase() || ''
      const file_type = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension) 
        ? (fileExtension === 'pdf' ? 'pdf' : 'image')
        : 'unknown'
      
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
        reviewed_by_ejecutiva: doc.reviewed_by_ejecutiva || 'No especificado',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        reviewed_at: doc.approved_at || doc.updated_at,
        // Create transportistas object from available data
        transportistas: {
          id: doc.subcontractor_id,
          razon_social: 'Subcontratista',
          rut: doc.subcontractor_rut
        },
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
