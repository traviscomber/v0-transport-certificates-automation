import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/company/documents/all
 * Returns ALL documents from all drivers (for dashboard statistics)
 * No parameters required
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    console.log('[v0] Fetching ALL documents for dashboard stats')

    // STEP: Query ALL uploaded_documents
    const { data: documents, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select(`
        id,
        conductor_id,
        original_filename,
        document_type_id,
        file_url,
        validation_status,
        rejection_reason,
        created_at,
        expiration_date,
        document_types (
          id,
          code,
          name
        ),
        conductores (
          id,
          nombres,
          apellido_paterno,
          rut
        )
      `)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying uploaded_documents:', dbError.message)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    // Map to response format
    const mappedDocs = (documents || []).map((doc: any) => {
      const docType = doc.document_types
      const conductor = doc.conductores

      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_type: docType?.name || docType?.code || 'Unknown',
        file_url: doc.file_url,
        validation_status: doc.validation_status || 'pending',
        rejection_reason: doc.rejection_reason,
        created_at: doc.created_at,
        expiration_date: doc.expiration_date,
        conductores: conductor,
        document_types: docType,
      }
    })

    console.log('[v0] Returned', mappedDocs.length, 'documents for dashboard')

    return NextResponse.json({ success: true, documents: mappedDocs }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/all:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
