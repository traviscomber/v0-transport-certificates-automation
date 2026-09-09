import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth, type UserRole } from '@/lib/auth-middleware'
import { classifyIntelligenceQuery } from '@/lib/intelligence-core'
import {
  getCompanyCompliance,
  getCompanyDocuments,
  searchCompany,
  type CompanySearchResult,
} from '@/lib/intelligence-tools'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const requestSchema = z.object({
  query: z.string().trim().min(2).max(160),
})

const ALLOWED_ROLES = new Set<UserRole>([
  'super_admin',
  'admin',
  'administrador',
  'ejecutiva',
  'prevencionista',
])

function companyLabel(company: CompanySearchResult) {
  return company.razon_social || company.nombre_fantasia || company.rut || 'Empresa'
}

function baseResponse(route: ReturnType<typeof classifyIntelligenceQuery>) {
  return {
    intelligenceCore: 'v1',
    router: 'deterministic-v1',
    mode: route.mode,
    intent: route.intent,
    readOnly: true,
    observedAt: new Date().toISOString(),
  }
}

function companyEvidence(company: CompanySearchResult) {
  return {
    kind: 'company',
    source: 'transportistas',
    entityId: company.id,
    rut: company.rut,
    label: companyLabel(company),
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || 'No autenticado' }, { status: 401 })
    }

    if (!ALLOWED_ROLES.has(auth.user.role)) {
      return NextResponse.json({ error: 'No autorizado para Intelligence Core' }, { status: 403 })
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Consulta inválida', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const route = classifyIntelligenceQuery(parsed.data.query)
    const supabase = createAdminClient()

    if (route.intent === 'unsupported') {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'unsupported_v1',
          summary: 'Intelligence Core v1 todavía está limitado a empresas, documentos y estado documental observado.',
          unknowns: ['La consulta requiere una capability que aún no está habilitada en v1.'],
          nextActions: [],
        },
        evidence: [],
      })
    }

    const candidates = await searchCompany(supabase, route.normalizedQuery)

    if (candidates.length === 0) {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'no_data',
          summary: 'No encontré una empresa que coincida con la consulta.',
          unknowns: ['No se resolvió una entidad canónica en transportistas.'],
          nextActions: [{ label: 'Abrir Subcontratistas', href: '/dashboard/company/subcontratistas' }],
        },
        evidence: [],
      })
    }

    if (candidates.length > 1) {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'ambiguous_entity',
          summary: 'La consulta coincide con más de una empresa. Selecciona la entidad correcta antes de analizar evidencia operacional.',
          unknowns: ['Entidad no resuelta de forma unívoca.'],
          nextActions: [{ label: 'Abrir Subcontratistas', href: '/dashboard/company/subcontratistas' }],
        },
        candidates,
        evidence: candidates.map(companyEvidence),
      })
    }

    const company = candidates[0]

    if (route.intent === 'entity_search') {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'resolved',
          summary: `${companyLabel(company)}${company.rut ? ` · ${company.rut}` : ''}`,
          unknowns: [],
          nextActions: [{ label: 'Abrir Subcontratistas', href: '/dashboard/company/subcontratistas' }],
        },
        company,
        evidence: [companyEvidence(company)],
      })
    }

    if (route.intent === 'company_documents') {
      const documents = await getCompanyDocuments(supabase, company)
      const statusCounts = documents.reduce<Record<string, number>>((acc, document) => {
        const status = String(document.status || 'unknown').toLowerCase()
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: documents.length > 0 ? 'resolved' : 'no_evidence',
          summary: `${companyLabel(company)} tiene ${documents.length} documentos actuales observados en la capa de subcontratistas.`,
          facts: { currentDocuments: documents.length, statusCounts },
          unknowns: documents.length > 0 ? [] : ['No hay documentos actuales observados para esta empresa.'],
          nextActions: [{ label: 'Abrir Documentos', href: '/dashboard/company/documentos' }],
        },
        company,
        documents,
        evidence: [
          companyEvidence(company),
          {
            kind: 'document_set',
            source: 'subcontractor_documents',
            entityId: company.id,
            currentOnly: true,
            count: documents.length,
          },
        ],
      })
    }

    const { compliance, documents } = await getCompanyCompliance(supabase, company)
    const summaryByStatus = {
      attention_required: 'Hay evidencia documental actual que requiere atención.',
      review_pending: 'Hay documentos actuales pendientes de revisión.',
      no_observed_blocker: 'No se observa un bloqueo en los estados documentales actuales consultados.',
      no_evidence: 'No hay evidencia documental actual suficiente en esta capa.',
    }

    console.info('[ChileFlota Intelligence Core]', {
      intent: route.intent,
      mode: route.mode,
      candidateCount: candidates.length,
      documentCount: documents.length,
      readOnly: true,
    })

    return NextResponse.json({
      ...baseResponse(route),
      answer: {
        status: compliance.status,
        summary: `${companyLabel(company)}: ${summaryByStatus[compliance.status]}`,
        facts: compliance.counts,
        interpretation: 'Resumen de estados documentales actuales observados.',
        unknowns: compliance.unknowns,
        nextActions: [{ label: 'Abrir Compliance', href: '/dashboard/company/compliance' }],
      },
      company,
      compliance,
      evidence: [
        companyEvidence(company),
        {
          kind: 'compliance_observation',
          source: 'subcontractor_documents',
          entityId: company.id,
          scope: compliance.scope,
          currentOnly: true,
          counts: compliance.counts,
        },
      ],
    })
  } catch (error) {
    console.error('[ChileFlota Intelligence Core] request failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'No se pudo resolver la consulta operacional' }, { status: 500 })
  }
}
