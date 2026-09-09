import type { SupabaseClient } from '@supabase/supabase-js'
import {
  normalizeCompanySearchTerm,
  normalizeDriverSearchTerm,
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

export type DriverSearchResult = {
  id: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  clase_licencia: string | null
  vencimiento_licencia: string | null
  is_active: boolean | null
  transportista_id: string | null
  rut_proveedor: string | null
}

export type DriverDocumentResult = {
  id: string
  conductor_id: string | null
  document_type_id: string | null
  original_filename: string | null
  validation_status: string | null
  expiration_date: string | null
  rejection_reason: string | null
  created_at: string | null
  updated_at: string | null
  is_current: boolean | null
  docType: { code: string | null; name: string | null } | null
}

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}

function normalizeText(value: string | null | undefined) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeRut(value: string | null | undefined) {
  return (value || '').toLowerCase().replace(/[^0-9k]/g, '')
}

export function driverDisplayName(driver: Pick<DriverSearchResult, 'nombres' | 'apellido_paterno' | 'apellido_materno' | 'rut'>) {
  return [driver.nombres, driver.apellido_paterno, driver.apellido_materno].filter(Boolean).join(' ').trim() || driver.rut || 'Conductor'
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

export async function searchDriver(
  supabase: SupabaseClient,
  rawQuery: string,
  limit = 8,
): Promise<DriverSearchResult[]> {
  const term = normalizeDriverSearchTerm(rawQuery)
  if (term.length < 2) return []

  const select = 'id,rut,nombres,apellido_paterno,apellido_materno,clase_licencia,vencimiento_licencia,is_active,transportista_id,rut_proveedor'
  const normalizedQuery = normalizeText(term)
  const rutQuery = normalizeRut(term)
  const tokens = normalizedQuery.split(' ').filter((token) => token.length >= 2)
  const seed = tokens[0] || normalizedQuery
  const seedPattern = `%${seed}%`

  const [rutResult, namesResult, paternalResult, maternalResult] = await Promise.all([
    supabase.from('conductores').select(select).ilike('rut', `%${term}%`).limit(20),
    supabase.from('conductores').select(select).ilike('nombres', seedPattern).limit(20),
    supabase.from('conductores').select(select).ilike('apellido_paterno', seedPattern).limit(20),
    supabase.from('conductores').select(select).ilike('apellido_materno', seedPattern).limit(20),
  ])

  for (const result of [rutResult, namesResult, paternalResult, maternalResult]) {
    if (result.error) throw result.error
  }

  return uniqueById([
    ...((rutResult.data || []) as DriverSearchResult[]),
    ...((namesResult.data || []) as DriverSearchResult[]),
    ...((paternalResult.data || []) as DriverSearchResult[]),
    ...((maternalResult.data || []) as DriverSearchResult[]),
  ])
    .filter((driver) => {
      if (rutQuery.length >= 7 && normalizeRut(driver.rut).includes(rutQuery)) return true
      const haystack = normalizeText(`${driverDisplayName(driver)} ${driver.rut || ''}`)
      return tokens.length > 0 && tokens.every((token) => haystack.includes(token))
    })
    .sort((a, b) => {
      const aRut = normalizeRut(a.rut)
      const bRut = normalizeRut(b.rut)
      if (rutQuery.length >= 7 && aRut === rutQuery && bRut !== rutQuery) return -1
      if (rutQuery.length >= 7 && bRut === rutQuery && aRut !== rutQuery) return 1
      const aName = normalizeText(driverDisplayName(a))
      const bName = normalizeText(driverDisplayName(b))
      if (aName === normalizedQuery && bName !== normalizedQuery) return -1
      if (bName === normalizedQuery && aName !== normalizedQuery) return 1
      return aName.localeCompare(bName, 'es')
    })
    .slice(0, limit)
}

export async function getDriverDocuments(
  supabase: SupabaseClient,
  driver: Pick<DriverSearchResult, 'id'>,
  limit = 100,
): Promise<DriverDocumentResult[]> {
  const select = 'id,conductor_id,document_type_id,original_filename,validation_status,expiration_date,rejection_reason,created_at,updated_at,is_current'
  const result = await supabase
    .from('uploaded_documents')
    .select(select)
    .eq('conductor_id', driver.id)
    .eq('is_current', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (result.error) throw result.error
  const rows = (result.data || []) as Omit<DriverDocumentResult, 'docType'>[]
  const typeIds = [...new Set(rows.map((row) => row.document_type_id).filter(Boolean))] as string[]
  const typeMap = new Map<string, { code: string | null; name: string | null }>()

  if (typeIds.length > 0) {
    const types = await supabase.from('document_types').select('id,code,name').in('id', typeIds)
    if (types.error) throw types.error
    for (const type of types.data || []) {
      typeMap.set(type.id, { code: type.code ?? null, name: type.name ?? null })
    }
  }

  return rows.map((row) => ({
    ...row,
    docType: row.document_type_id ? typeMap.get(row.document_type_id) || null : null,
  }))
}
