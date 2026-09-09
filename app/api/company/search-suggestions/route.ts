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
  type: 'company' | 'document'
  label: string
  secondary: string | null
  value: string
  href: string
}

function sanitize(raw: string) {
  return raw.trim().replace(/[%_]/g, '').replace(/\s+/g, ' ').slice(0, 80)
}

function toHref(value: string) {
  return `/dashboard/company/documentos/aprobados?search=${encodeURIComponent(value)}`
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

    const [companyByName, companyByRut, companyByFantasy, subcontractorDocs, driverDocs] = await Promise.all([
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

    for (const result of [companyByName, companyByRut, companyByFantasy, subcontractorDocs, driverDocs]) {
      if (result.error) throw result.error
    }

    const suggestions: SearchSuggestion[] = []
    const seen = new Set<string>()

    const companies = [
      ...(companyByName.data || []),
      ...(companyByRut.data || []),
      ...(companyByFantasy.data || []),
    ]

    for (const company of companies) {
      if (seen.has(`company:${company.id}`)) continue
      seen.add(`company:${company.id}`)
      const label = company.razon_social || company.nombre_fantasia || company.rut || 'Empresa'
      const value = company.razon_social || company.nombre_fantasia || company.rut || query
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

    for (const doc of subcontractorDocs.data || []) {
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
      if (suggestions.length >= 8) break
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
