import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/company/documents/renovar
 * Returns documents expiring in 7-30 days (próximos a vencer)
 * Used for preventive renewal workflow
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    console.log('[v0] Fetching documents expiring in 7-30 days')

    // Calculate date range: 7-30 days from now
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    // STEP: Query documents with expiration_date in 7-30 day range
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
      .gte('expiration_date', sevenDaysFromNow.toISOString().split('T')[0])
      .lte('expiration_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .eq('validation_status', 'approved')
      .order('expiration_date', { ascending: true })

    if (dbError) {
      console.error('[v0] Error querying documents to renew:', dbError.message)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    // Map to response format with days until expiration
    const mappedDocs = (documents || []).map((doc: any) => {
      const expirationDate = new Date(doc.expiration_date)
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const docType = doc.document_types
      const conductor = doc.conductores

      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_type: docType?.name || docType?.code || 'Unknown',
        file_url: doc.file_url,
        validation_status: doc.validation_status || 'pending',
        created_at: doc.created_at,
        expiration_date: doc.expiration_date,
        days_until_expiration: daysUntilExpiration,
        conductores: conductor,
        document_types: docType,
      }
    })

    console.log('[v0] Returned', mappedDocs.length, 'documents expiring in 7-30 days')

    return NextResponse.json({ success: true, documents: mappedDocs }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/renovar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents for renewal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
