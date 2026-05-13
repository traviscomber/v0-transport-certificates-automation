export const dynamic = 'force-dynamic'
/**
 * GET /api/company/documents/rechazados
 * Returns rejected documents for both conductors and subcontractors
 * FIXED: Using correct field names from the actual database schema
 */

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.user) {
      console.log('[v0] Rechazados: Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      .limit(100)

    console.log('[v0] Rechazados: Conductor docs result -', conductorDocs?.length || 0, 'docs,', conductorError ? 'ERROR' : 'OK')
    
    if (conductorError) {
      console.error('[v0] Rechazados endpoint: Conductor error:', conductorError)
      // Don't throw, just log and continue
    }

    // Get rejected subcontractor documents - use CORRECT field names: file_name NOT document_name
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select(`
        id,
        file_name,
        document_type_id,
        status,
        file_url,
        rejection_reason,
        created_at,
        updated_at,
        transportista_id,
        transportistas (
          id,
          razon_social,
          rut
        )
      `)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(100)

    console.log('[v0] Rechazados: Sub docs result -', subDocs?.length || 0, 'docs,', subError ? 'ERROR' : 'OK')
    
    if (subError) {
      console.error('[v0] Rechazados endpoint: Sub error:', subError)
      // Don't throw, just log and continue
    }

    // Normalize data to consistent format
    const normalizedConductor = (conductorDocs || []).map((doc: any) => ({
      id: doc.id,
      filename: doc.original_filename,
      document_type_id: doc.document_type_id,
      status: doc.validation_status,
      file_url: doc.file_url,
      rejection_reason: doc.rejection_reason,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      person_name: doc.conductores ? `${doc.conductores.nombres} ${doc.conductores.apellido_paterno}` : 'Unknown',
      person_rut: doc.conductores?.rut,
      document_source: 'conductor'
    }))

    const normalizedSub = (subDocs || []).map((doc: any) => ({
      id: doc.id,
      filename: doc.file_name,
      document_type_id: doc.document_type_id,
      status: doc.status,
      file_url: doc.file_url,
      rejection_reason: doc.rejection_reason,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      person_name: doc.transportistas?.razon_social,
      person_rut: doc.transportistas?.rut,
      document_source: 'subcontractor'
    }))

    const allDocs = [...normalizedConductor, ...normalizedSub]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    console.log('[v0] Rechazados endpoint: Returning', allDocs.length, 'rejected documents')

    return NextResponse.json({
      conductorDocs: normalizedConductor,
      subDocs: normalizedSub,
      allDocs: allDocs,
      total: allDocs.length,
      timestamp: new Date().toISOString()
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
