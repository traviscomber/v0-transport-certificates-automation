/**
 * GET /api/company/documents/rechazados
 * Returns rejected documents for both conductors and subcontractors
 */

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    console.log('[v0] Rechazados endpoint: Fetching rejected documents')

    // Get rejected conductor documents
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
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .eq('validation_status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(100)

    if (conductorError) {
      console.error('[v0] Rechazados endpoint: Error fetching conductor docs:', conductorError)
      throw conductorError
    }

    // Get rejected subcontractor documents
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select(`
        id,
        document_name,
        document_type,
        status,
        file_url,
        rejection_reason,
        created_at,
        transportistas (
          id,
          razon_social,
          rut
        )
      `)
      .eq('status', 'rechazado')
      .order('created_at', { ascending: false })
      .limit(100)

    if (subError) {
      console.error('[v0] Rechazados endpoint: Error fetching subcontractor docs:', subError)
      throw subError
    }

    console.log('[v0] Rechazados endpoint: Returning rejected documents', {
      conductor: conductorDocs?.length || 0,
      subcontractor: subDocs?.length || 0
    })

    return NextResponse.json({
      conductorDocs: conductorDocs || [],
      subDocs: subDocs || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[v0] Rechazados endpoint: Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching rejected documents' },
      { status: 500 }
    )
  }
}
