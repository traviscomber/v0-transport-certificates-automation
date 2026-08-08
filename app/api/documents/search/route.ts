import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

/**
 * subcontractor_documents.subcontractor_rut is stored canonically as
 * 12345678-9 (without dots). Normalize user input before querying so the
 * database can apply the RUT filter before pagination/limits.
 */
function normalizeRut(value: string) {
  const cleaned = value.toUpperCase().replace(/[^0-9K]/g, '')

  if (cleaned.length < 2) {
    return ''
  }

  return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const params = request.nextUrl.searchParams
    const query = params.get('query')?.toLowerCase() || ''
    const rut = params.get('rut')?.trim() || ''
    const normalizedRut = rut ? normalizeRut(rut) : ''
    const documentType = params.get('documentType')?.trim() || ''
    const status = params.get('status')?.trim() || ''
    const dateFrom = params.get('dateFrom')?.trim() || ''
    const dateTo = params.get('dateTo')?.trim() || ''

    // Build query. RUT must be filtered in Postgres before the 100-row limit;
    // filtering after the limit made valid subcontractors disappear whenever
    // their documents were outside the newest 100 rows.
    let dbQuery = supabase
      .from('subcontractor_documents')
      .select(`
        id,
        file_name,
        document_type_id,
        subcontractor_id,
        subcontractor_rut,
        status,
        created_at,
        file_url,
        subcontractor_documents_subcontractor_id_fkey:subcontractor_id (
          id,
          razon_social,
          nombre_fantasia,
          rut
        ),
        subcontractor_document_types:document_type_id (
          code
        )
      `, { count: 'exact' })

    // Apply database-side filters before ordering/limiting.
    if (normalizedRut) {
      dbQuery = dbQuery.eq('subcontractor_rut', normalizedRut)
    }

    if (status) {
      dbQuery = dbQuery.eq('status', status)
    }

    if (documentType) {
      dbQuery = dbQuery.eq('document_type_id', documentType)
    }

    if (dateFrom) {
      dbQuery = dbQuery.gte('created_at', dateFrom + 'T00:00:00Z')
    }

    if (dateTo) {
      dbQuery = dbQuery.lte('created_at', dateTo + 'T23:59:59Z')
    }

    const { data: documents, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Error searching documents' },
        { status: 500 }
      )
    }

    let results = documents || []

    // Free-text search still runs on the already RUT/status/date-scoped result
    // set because it spans both document and related subcontractor fields.
    if (query) {
      results = results.filter((doc: any) => {
        const fileName = doc.file_name?.toLowerCase() || ''
        const subName = (doc.subcontractor_documents_subcontractor_id_fkey?.nombre_fantasia ||
                        doc.subcontractor_documents_subcontractor_id_fkey?.razon_social)?.toLowerCase() || ''
        return fileName.includes(query) || subName.includes(query)
      })
    }

    const formattedResults = results.map((doc: any) => ({
      id: doc.id,
      file_name: doc.file_name,
      document_type_id: doc.document_type_id,
      type_code: doc.subcontractor_document_types?.code || 'UNKNOWN',
      subcontractor_id: doc.subcontractor_id,
      subcontractor_name: doc.subcontractor_documents_subcontractor_id_fkey?.nombre_fantasia ||
                         doc.subcontractor_documents_subcontractor_id_fkey?.razon_social || 'Sin asignar',
      subcontractor_rut: doc.subcontractor_rut ||
                         doc.subcontractor_documents_subcontractor_id_fkey?.rut || '',
      status: doc.status,
      created_at: doc.created_at,
      file_url: doc.file_url
    }))

    return NextResponse.json({
      results: formattedResults,
      total: formattedResults.length
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
