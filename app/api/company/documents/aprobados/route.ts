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

    console.log('[v0] Aprobados endpoint: Fetching approved documents')

    // Get approved conductor documents - only 'approved' (English)
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
      .limit(100)

    if (conductorError) {
      console.error('[v0] Aprobados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    // Get approved subcontractor documents - use CORRECT field names: file_name NOT document_name
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select(`
        id,
        file_name,
        document_type_id,
        status,
        file_url,
        approved_at,
        reviewed_by_ejecutiva,
        created_at,
        updated_at,
        transportista_id,
        transportistas (
          id,
          razon_social,
          rut
        )
      `)
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (subError) {
      console.error('[v0] Aprobados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
    }

    // Normalize data to match component expectations - keep nested objects intact
    const normalizedConductor = (conductorDocs || []).map((doc: any) => ({
      id: doc.id,
      original_filename: doc.original_filename,
      document_type_id: doc.document_type_id,
      validation_status: doc.validation_status,
      status: doc.validation_status, // For component compatibility
      file_url: doc.file_url,
      validated_at: doc.validated_at,
      ejecutiva: doc.ejecutiva,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      reviewed_at: doc.validated_at, // Map validated_at to reviewed_at for component compatibility
      conductores: doc.conductores,
      document_source: 'conductor'
    }))

    const normalizedSub = (subDocs || []).map((doc: any) => ({
      id: doc.id,
      document_name: doc.file_name,
      file_name: doc.file_name,
      original_filename: doc.file_name, // For component compatibility
      document_type_id: doc.document_type_id,
      status: doc.status,
      file_url: doc.file_url,
      approved_at: doc.approved_at,
      reviewed_by_ejecutiva: doc.reviewed_by_ejecutiva,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      reviewed_at: doc.approved_at, // Map approved_at to reviewed_at for component compatibility
      transportistas: doc.transportistas,
      document_source: 'subcontractor'
    }))

    const allDocs = [...normalizedConductor, ...normalizedSub]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    console.log('[v0] Aprobados endpoint: Returning', allDocs.length, 'approved documents')

    return NextResponse.json({
      conductorDocs: normalizedConductor,
      subDocs: normalizedSub,
      allDocs: allDocs,
      total: allDocs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[v0] Aprobados endpoint: Caught error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[v0] Error stack:', errorStack)
    
    return NextResponse.json(
      { error: errorMessage, detail: 'Aprobados endpoint error' },
      { status: 500 }
    )
  }
}
