import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth, type UserRole } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_ROLES = new Set<UserRole>([
  'super_admin',
  'admin',
  'administrador',
  'ejecutiva',
  'prevencionista',
])

type SearchSuggestion = {
  id: string
  type: 'company' | 'driver' | 'document'
  label: string
  secondary: string | null
  value: string
  href: string
}

type CompanyRow = {
  id: string
  rut: string | null
  razon_social: string | null
  nombre_fantasia: string | null
}

type DriverRow = {
  id: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
}

function sanitize(raw: string) {
  return raw.trim().replace(/[%_]/g, '').replace(/\s+/g, ' ').slice(0, 80)
}

function normalizeText(value: string | null | undefined) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function normalizeRut(value: string | null | undefined) {
  return (value || '').toLowerCase().replace(/[^0-9k]/g, '')
}

function companyRank(company: CompanyRow, query: string) {
  const normalizedQuery = normalizeText(query)
  const normalizedQueryRut = normalizeRut(query)
  const rut = normalizeRut(company.rut)
  const legalName = normalizeText(company.razon_social)
  const fantasyName = normalizeText(company.nombre_fantasia)

  if (normalizedQueryRut.length >= 7 && rut && rut === normalizedQueryRut) return 0
  if (legalName && legalName === normalizedQuery) return 1
  if (fantasyName && fantasyName === normalizedQuery) return 1
  if (normalizedQueryRut && rut.startsWith(normalizedQueryRut)) return 2
  if (legalName.startsWith(normalizedQuery) || fantasyName.startsWith(normalizedQuery)) return 2
  return 3
}

function driverLabel(driver: DriverRow) {
  return [driver.nombres, driver.apellido_paterno, driver.apellido_materno].filter(Boolean).join(' ').trim() || driver.rut || 'Conductor'
}

function driverRank(driver: DriverRow, query: string) {
  const normalizedQuery = normalizeText(query)
  const normalizedQueryRut = normalizeRut(query)
  const rut = normalizeRut(driver.rut)
  const name = normalizeText(driverLabel(driver))

  if (normalizedQueryRut.length >= 7 && rut && rut === normalizedQueryRut) return 0
  if (name && name === normalizedQuery) return 1
  if (normalizedQueryRut && rut.startsWith(normalizedQueryRut)) return 2
  if (name.startsWith(normalizedQuery)) return 2
  return 3
}

function toHref(value: string) {
  return `/dashboard/company/documentos/aprobados?search=${encodeURIComponent(value)}`
}

function toDriverHref(driver: DriverRow) {
  return driver.rut
    ? `/dashboard/company/conductores?rut=${encodeURIComponent(driver.rut)}`
    : '/dashboard/company/conductores'
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'No autenticado' }, { status: 401 })
    }

    if (!ALLOWED_ROLES.has(auth.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const query = sanitize(new URL(request.url).searchParams.get('q') || '')
    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const supabase = createAdminClient()
    const pattern = `%${query}%`
    const normalizedQuery = normalizeText(query)
    const driverTokens = normalizedQuery.split(' ').filter((token) => token.length >= 2)
    const driverSeed = driverTokens[0] || normalizedQuery
    const driverPattern = `%${driverSeed}%`

    const [
      companyByName,
      companyByRut,
      companyByFantasy,
      driverByRut,
      driverByNames,
      driverByPaternal,
      driverByMaternal,
      subcontractorDocs,
      driverDocs,
    ] = await Promise.all([
      supabase
        .from('transportistas')
        .select('id,rut,razon_social,nombre_fantasia')
        .ilike('razon_social', pattern)
        .limit(4),
      supabase
        .from('transportistas')
        .select('id,rut,razon_social,nombre_fantasia')
        .ilike('rut', pattern)
        .limit(4),
      supabase
        .from('transportistas')
        .select('id,rut,razon_social,nombre_fantasia')
        .ilike('nombre_fantasia', pattern)
        .limit(4),
      supabase
        .from('conductores')
        .select('id,rut,nombres,apellido_paterno,apellido_materno')
        .ilike('rut', pattern)
        .limit(8),
      supabase
        .from('conductores')
        .select('id,rut,nombres,apellido_paterno,apellido_materno')
        .ilike('nombres', driverPattern)
        .limit(8),
      supabase
        .from('conductores')
        .select('id,rut,nombres,apellido_paterno,apellido_materno')
        .ilike('apellido_paterno', driverPattern)
        .limit(8),
      supabase
        .from('conductores')
        .select('id,rut,nombres,apellido_paterno,apellido_materno')
        .ilike('apellido_materno', driverPattern)
        .limit(8),
      supabase
        .from('subcontractor_documents')
        .select('id,file_name,subcontractor_rut')
        .eq('is_current', true)
        .eq('status', 'approved')
        .or(`file_name.ilike.${pattern},subcontractor_rut.ilike.${pattern}`)
        .order('updated_at', { ascending: false })
        .limit(4),
      supabase
        .from('uploaded_documents')
        .select('id,original_filename')
        .eq('is_current', true)
        .eq('validation_status', 'approved')
        .ilike('original_filename', pattern)
        .order('updated_at', { ascending: false })
        .limit(4),
    ])

    for (const result of [
      companyByName,
      companyByRut,
      companyByFantasy,
      driverByRut,
      driverByNames,
      driverByPaternal,
      driverByMaternal,
      subcontractorDocs,
      driverDocs,
    ]) {
      if (result.error) throw result.error
    }

    const suggestions: SearchSuggestion[] = []
    const seen = new Set<string>()
    const normalizedQueryRut = normalizeRut(query)

    const companies = [
      ...((companyByName.data || []) as CompanyRow[]),
      ...((companyByRut.data || []) as CompanyRow[]),
      ...((companyByFantasy.data || []) as CompanyRow[]),
    ]
      .filter((company, index, rows) => rows.findIndex((row) => row.id === company.id) === index)
      .sort((a, b) => {
        const rankDiff = companyRank(a, query) - companyRank(b, query)
        if (rankDiff !== 0) return rankDiff
        return (a.razon_social || a.nombre_fantasia || a.rut || '').localeCompare(
          b.razon_social || b.nombre_fantasia || b.rut || '',
          'es',
        )
      })

    for (const company of companies) {
      if (seen.has(`company:${company.id}`)) continue
      seen.add(`company:${company.id}`)
      const label = company.razon_social || company.nombre_fantasia || company.rut || 'Empresa'
      const exactRut = normalizedQueryRut.length >= 7 && normalizeRut(company.rut) === normalizedQueryRut
      const value = exactRut
        ? company.rut || query
        : company.razon_social || company.nombre_fantasia || company.rut || query
      suggestions.push({
        id: `company:${company.id}`,
        type: 'company',
        label,
        secondary: company.rut || null,
        value,
        href: toHref(value),
      })
      if (suggestions.length >= 5) break
    }

    const drivers = [
      ...((driverByRut.data || []) as DriverRow[]),
      ...((driverByNames.data || []) as DriverRow[]),
      ...((driverByPaternal.data || []) as DriverRow[]),
      ...((driverByMaternal.data || []) as DriverRow[]),
    ]
      .filter((driver, index, rows) => rows.findIndex((row) => row.id === driver.id) === index)
      .filter((driver) => {
        if (normalizedQueryRut.length >= 7 && normalizeRut(driver.rut).includes(normalizedQueryRut)) return true
        const haystack = normalizeText(`${driverLabel(driver)} ${driver.rut || ''}`)
        return driverTokens.length > 0 && driverTokens.every((token) => haystack.includes(token))
      })
      .sort((a, b) => {
        const rankDiff = driverRank(a, query) - driverRank(b, query)
        if (rankDiff !== 0) return rankDiff
        return driverLabel(a).localeCompare(driverLabel(b), 'es')
      })

    for (const driver of drivers) {
      if (suggestions.length >= 8 || seen.has(`driver:${driver.id}`)) break
      seen.add(`driver:${driver.id}`)
      const label = driverLabel(driver)
      const exactRut = normalizedQueryRut.length >= 7 && normalizeRut(driver.rut) === normalizedQueryRut
      suggestions.push({
        id: `driver:${driver.id}`,
        type: 'driver',
        label,
        secondary: driver.rut || 'Conductor',
        value: exactRut ? driver.rut || query : label,
        href: toDriverHref(driver),
      })
    }

    for (const doc of subcontractorDocs.data || []) {
      if (suggestions.length >= 8) break
      if (!doc.file_name || seen.has(`document:${doc.id}`)) continue
      seen.add(`document:${doc.id}`)
      suggestions.push({
        id: `document:${doc.id}`,
        type: 'document',
        label: doc.file_name,
        secondary: doc.subcontractor_rut || 'Documento de subcontratista',
        value: doc.file_name,
        href: toHref(doc.file_name),
      })
    }

    if (suggestions.length < 8) {
      for (const doc of driverDocs.data || []) {
        if (!doc.original_filename || seen.has(`driver-document:${doc.id}`)) continue
        seen.add(`driver-document:${doc.id}`)
        suggestions.push({
          id: `driver-document:${doc.id}`,
          type: 'document',
          label: doc.original_filename,
          secondary: 'Documento de conductor',
          value: doc.original_filename,
          href: toHref(doc.original_filename),
        })
        if (suggestions.length >= 8) break
      }
    }

    const response = NextResponse.json({ suggestions })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    console.error('[ChileFlota search suggestions] failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'No se pudieron cargar coincidencias' }, { status: 500 })
  }
}
