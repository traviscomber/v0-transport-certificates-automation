import type { SupabaseClient } from '@supabase/supabase-js'
import {
  normalizeCompanySearchTerm,
  summarizeObservedCompanyCompliance,
  type CompanyEvidenceDocument,
} from '@/lib/intelligence-core'

export type CompanySearchResult = {
  id: string
  rut: string | null
  razon_social: string | null
  nombre_fantasia: string | null
}

export type CompanyDocumentResult = CompanyEvidenceDocument & {
  file_name: string | null
  document_type_id: string | null
  subcontractor_id: string | null
  subcontractor_rut: string | null
  docType: { code: string | null; nombre: string | null } | null
}

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}

export async function searchCompany(
  supabase: SupabaseClient,
  rawQuery: string,
  limit = 8,
): Promise<CompanySearchResult[]> {
  const term = normalizeCompanySearchTerm(rawQuery)
  if (term.length < 2) return []

  const pattern = `%${term}%`
  const select = 'id,rut,razon_social,nombre_fantasia'

  const [rutResult, legalNameResult, fantasyNameResult] = await Promise.all([
    supabase.from('transportistas').select(select).ilike('rut', pattern).limit(limit),
    supabase.from('transportistas').select(select).ilike('razon_social', pattern).limit(limit),
    supabase.from('transportistas').select(select).ilike('nombre_fantasia', pattern).limit(limit),
  ])

  for (const result of [rutResult, legalNameResult, fantasyNameResult]) {
    if (result.error) throw result.error
  }

  return uniqueById([
    ...((rutResult.data || []) as CompanySearchResult[]),
    ...((legalNameResult.data || []) as CompanySearchResult[]),
    ...((fantasyNameResult.data || []) as CompanySearchResult[]),
  ]).slice(0, limit)
}

export async function getCompanyDocuments(
  supabase: SupabaseClient,
  company: Pick<CompanySearchResult, 'id' | 'rut'>,
  limit = 200,
): Promise<CompanyDocumentResult[]> {
  const select = 'id,file_name,document_type_id,status,uploaded_at,reviewed_at,subcontractor_id,subcontractor_rut,is_current'

  const byId = await supabase
    .from('subcontractor_documents')
    .select(select)
    .eq('subcontractor_id', company.id)
    .eq('is_current', true)
    .order('uploaded_at', { ascending: false })
    .limit(limit)

  if (byId.error) throw byId.error

  let rows = (byId.data || []) as Omit<CompanyDocumentResult, 'docType'>[]

  if (rows.length === 0 && company.rut) {
    const byRut = await supabase
      .from('subcontractor_documents')
      .select(select)
      .eq('subcontractor_rut', company.rut)
      .eq('is_current', true)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (byRut.error) throw byRut.error
    rows = (byRut.data || []) as Omit<CompanyDocumentResult, 'docType'>[]
  }

  const typeIds = [...new Set(rows.map((row) => row.document_type_id).filter(Boolean))] as string[]
  const typeMap = new Map<string, { code: string | null; nombre: string | null }>()

  if (typeIds.length > 0) {
    const types = await supabase
      .from('subcontractor_document_types')
      .select('id,code,nombre')
      .in('id', typeIds)

    if (types.error) throw types.error
    for (const type of types.data || []) {
      typeMap.set(type.id, { code: type.code ?? null, nombre: type.nombre ?? null })
    }
  }

  return rows.map((row) => ({
    ...row,
    docType: row.document_type_id ? typeMap.get(row.document_type_id) || null : null,
  }))
}

export async function getCompanyCompliance(
  supabase: SupabaseClient,
  company: Pick<CompanySearchResult, 'id' | 'rut'>,
) {
  const documents = await getCompanyDocuments(supabase, company)
  return {
    compliance: summarizeObservedCompanyCompliance(documents),
    documents,
  }
}
