import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const params = request.nextUrl.searchParams
    const page = parsePositiveInteger(params.get('page'), 1)
    const limit = Math.min(parsePositiveInteger(params.get('limit'), DEFAULT_LIMIT), MAX_LIMIT)
    const source = params.get('source')
    const companyId = params.get('company_id')
    const conductorId = params.get('conductor_id')
    const offset = (page - 1) * limit

    const includeConductors = source !== 'subcontractor'
    const includeSubcontractors = source !== 'conductor'

    const conductorQuery = supabase
      .from('uploaded_documents')
      .select(
        `
          id,
          original_filename,
          document_type_id,
          validation_status,
          file_url,
          conductor_id,
          transportista_id,
          document_period_month,
          document_period_year,
          document_period_start,
          version_number,
          supersedes_document_id,
          versioned_at,
          created_at,
          updated_at,
          conductores (id, nombres, apellido_paterno, rut, rut_proveedor),
          document_types (id, code, name)
        `,
        { count: 'exact' },
      )
      .eq('is_current', false)
      .order('versioned_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (companyId) conductorQuery.eq('transportista_id', companyId)
    if (conductorId) conductorQuery.eq('conductor_id', conductorId)

    const subcontractorQuery = supabase
      .from('subcontractor_documents')
      .select(
        `
          id,
          file_name,
          document_type_id,
          status,
          file_url,
          subcontractor_id,
          subcontractor_rut,
          document_period_month,
          document_period_year,
          document_period_start,
          version_number,
          supersedes_document_id,
          versioned_at,
          created_at,
          updated_at,
          transportistas (id, razon_social, rut),
          subcontractor_document_types (id, code, nombre)
        `,
        { count: 'exact' },
      )
      .eq('is_current', false)
      .order('versioned_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (companyId) subcontractorQuery.eq('subcontractor_id', companyId)

    const [conductorResult, subcontractorResult] = await Promise.all([
      includeConductors ? conductorQuery : Promise.resolve({ data: [], count: 0, error: null }),
      includeSubcontractors ? subcontractorQuery : Promise.resolve({ data: [], count: 0, error: null }),
    ])

    if (conductorResult.error) throw conductorResult.error
    if (subcontractorResult.error) throw subcontractorResult.error

    const conductorDocuments = (conductorResult.data || []).map((document: any) => ({
      id: document.id,
      source: 'conductor',
      fileName: document.original_filename,
      status: document.validation_status,
      fileUrl: document.file_url,
      entity: document.conductores,
      documentType: document.document_types,
      period: {
        month: document.document_period_month,
        year: document.document_period_year,
        start: document.document_period_start,
      },
      versionNumber: document.version_number,
      supersedesDocumentId: document.supersedes_document_id,
      versionedAt: document.versioned_at,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    }))

    const subcontractorDocuments = (subcontractorResult.data || []).map((document: any) => ({
      id: document.id,
      source: 'subcontractor',
      fileName: document.file_name,
      status: document.status,
      fileUrl: document.file_url,
      entity: document.transportistas,
      documentType: document.subcontractor_document_types,
      period: {
        month: document.document_period_month,
        year: document.document_period_year,
        start: document.document_period_start,
      },
      versionNumber: document.version_number,
      supersedesDocumentId: document.supersedes_document_id,
      versionedAt: document.versioned_at,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    }))

    const documents = [...conductorDocuments, ...subcontractorDocuments]
      .sort((left, right) => {
        const leftTime = new Date(left.versionedAt || left.updatedAt || left.createdAt).getTime()
        const rightTime = new Date(right.versionedAt || right.updatedAt || right.createdAt).getTime()
        return rightTime - leftTime
      })
      .slice(0, limit)

    const total = (conductorResult.count || 0) + (subcontractorResult.count || 0)

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      explanation: 'Estas son versiones anteriores conservadas para trazabilidad. No representan documentos faltantes ni pendientes actuales.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Document history API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
