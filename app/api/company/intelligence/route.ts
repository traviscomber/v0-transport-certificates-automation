import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth, type UserRole } from '@/lib/auth-middleware'
import { classifyIntelligenceQuery, extractCompanyQuery, extractDriverQuery } from '@/lib/intelligence-core'
import {
  driverDisplayName,
  getCompanyCompliance,
  getCompanyDocuments,
  getDriverDocuments,
  searchCompany,
  searchDriver,
  type CompanySearchResult,
  type DriverSearchResult,
} from '@/lib/intelligence-tools'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const requestSchema = z.object({ query: z.string().trim().min(2).max(160) })
const ALLOWED_ROLES = new Set<UserRole>(['super_admin', 'admin', 'administrador', 'ejecutiva', 'prevencionista'])

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

function driverEvidence(driver: DriverSearchResult) {
  return {
    kind: 'driver',
    source: 'conductores',
    entityId: driver.id,
    rut: driver.rut,
    label: driverDisplayName(driver),
  }
}

function driverHref(driver: DriverSearchResult) {
  return driver.rut
    ? `/dashboard/company/conductores?rut=${encodeURIComponent(driver.rut)}`
    : '/dashboard/company/conductores'
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.user) return NextResponse.json({ error: auth.error || 'No autenticado' }, { status: 401 })
    if (!ALLOWED_ROLES.has(auth.user.role)) {
      return NextResponse.json({ error: 'No autorizado para Intelligence Core' }, { status: 403 })
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Consulta inválida', details: parsed.error.flatten() }, { status: 400 })
    }

    const route = classifyIntelligenceQuery(parsed.data.query)
    if (route.intent === 'unsupported') {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'unsupported_v1',
          summary: 'Intelligence Core v1 todavía está limitado a empresas, conductores, documentos y estado operacional observado.',
          unknowns: ['La consulta requiere una capability que aún no está habilitada en v1.'],
          nextActions: [],
        },
        evidence: [],
      })
    }

    const supabase = createAdminClient()

    if (route.intent === 'driver_documents' || route.intent === 'driver_status') {
      const entityQuery = extractDriverQuery(route)
      if (!entityQuery) {
        return NextResponse.json({
          ...baseResponse(route),
          answer: {
            status: 'needs_entity',
            summary: 'Indica el conductor o su RUT de forma explícita para revisar evidencia operacional.',
            unknowns: ['No pude separar de forma segura la intención y el conductor de la consulta.'],
            nextActions: [{ label: 'Abrir Conductores', href: '/dashboard/company/conductores' }],
          },
          evidence: [],
        })
      }

      const candidates = await searchDriver(supabase, entityQuery)
      if (candidates.length === 0) {
        return NextResponse.json({
          ...baseResponse(route),
          entityQuery,
          answer: {
            status: 'no_data',
            summary: 'No encontré un conductor que coincida con la consulta.',
            unknowns: ['No se resolvió una entidad canónica en conductores.'],
            nextActions: [{ label: 'Abrir Conductores', href: '/dashboard/company/conductores' }],
          },
          evidence: [],
        })
      }

      if (candidates.length > 1) {
        return NextResponse.json({
          ...baseResponse(route),
          entityQuery,
          answer: {
            status: 'ambiguous_entity',
            summary: 'La consulta coincide con más de un conductor. Usa el RUT o un nombre más específico.',
            unknowns: ['Conductor no resuelto de forma unívoca.'],
            nextActions: [{ label: 'Abrir Conductores', href: '/dashboard/company/conductores' }],
          },
          candidates,
          evidence: candidates.map(driverEvidence),
        })
      }

      const driver = candidates[0]
      const documents = await getDriverDocuments(supabase, driver)
      const today = new Date().toISOString().slice(0, 10)
      const counts = documents.reduce(
        (acc, document) => {
          const status = String(document.validation_status || '').toLowerCase()
          acc.total += 1
          if (status === 'approved' || status === 'validated') acc.approved += 1
          else if (status === 'pending' || status === 'uploaded') acc.pending += 1
          else if (status === 'rejected') acc.rejected += 1
          else acc.other += 1
          if (document.expiration_date && document.expiration_date < today) acc.expired += 1
          return acc
        },
        { total: 0, approved: 0, pending: 0, rejected: 0, other: 0, expired: 0 },
      )

      const inactive = driver.is_active === false
      const licenseExpired = Boolean(driver.vencimiento_licencia && driver.vencimiento_licencia < today)
      const attentionRequired = inactive || licenseExpired || counts.rejected > 0 || counts.expired > 0
      const reviewPending = !attentionRequired && counts.pending > 0
      const observedStatus = attentionRequired
        ? 'attention_required'
        : reviewPending
          ? 'review_pending'
          : counts.total === 0
            ? 'no_evidence'
            : 'no_observed_blocker'

      if (route.intent === 'driver_documents') {
        return NextResponse.json({
          ...baseResponse(route),
          entityQuery,
          answer: {
            status: documents.length > 0 ? 'resolved' : 'no_evidence',
            summary: `${driverDisplayName(driver)} tiene ${documents.length} documentos actuales observados.`,
            facts: {
              currentDocuments: counts.total,
              approved: counts.approved,
              pending: counts.pending,
              rejected: counts.rejected,
            },
            interpretation: driver.clase_licencia
              ? `Licencia registrada: clase ${driver.clase_licencia}${driver.vencimiento_licencia ? ` · vence ${driver.vencimiento_licencia}` : ''}.`
              : 'No hay clase de licencia registrada en la entidad consultada.',
            unknowns: ['La presencia de documentos no certifica por sí sola cobertura completa ni Operational Clearance.'],
            nextActions: [{ label: 'Abrir Conductor', href: driverHref(driver) }],
          },
          driver,
          documents,
          evidence: [
            driverEvidence(driver),
            { kind: 'driver_document_set', source: 'uploaded_documents', entityId: driver.id, currentOnly: true, count: documents.length },
          ],
        })
      }

      const summaryByStatus = {
        attention_required: 'Hay señales actuales que requieren atención antes de considerarlo operativo.',
        review_pending: 'Hay documentación actual pendiente de revisión.',
        no_observed_blocker: 'No se observan bloqueos en las señales consultadas, pero el clearance completo no está certificado.',
        no_evidence: 'No hay evidencia documental actual suficiente para evaluar su situación completa.',
      }

      console.info('[ChileFlota Intelligence Core]', {
        intent: route.intent,
        mode: route.mode,
        candidateCount: candidates.length,
        documentCount: documents.length,
        entityType: 'driver',
        readOnly: true,
      })

      return NextResponse.json({
        ...baseResponse(route),
        entityQuery,
        answer: {
          status: observedStatus,
          summary: `${driverDisplayName(driver)}: ${summaryByStatus[observedStatus]}`,
          facts: {
            currentDocuments: counts.total,
            rejected: counts.rejected,
            expired: counts.expired,
            licenseExpired: licenseExpired ? 'sí' : 'no',
          },
          interpretation: inactive
            ? 'El conductor figura inactivo en la entidad canónica.'
            : 'Lectura conservadora de estado del conductor, licencia y documentación actual observada.',
          unknowns: [
            'La cobertura completa de requisitos todavía no está certificada por esta señal.',
            'Este resultado no autoriza a declarar APTO ni reemplaza Operational Clearance.',
          ],
          nextActions: [{ label: 'Abrir Conductor', href: driverHref(driver) }],
        },
        driver,
        driverStatus: {
          status: observedStatus,
          active: !inactive,
          licenseExpired,
          counts,
          coverageCertified: false,
          canClaimOperationalClearance: false,
        },
        evidence: [
          driverEvidence(driver),
          { kind: 'driver_status_observation', source: 'conductores+uploaded_documents', entityId: driver.id, currentOnly: true, counts },
        ],
      })
    }

    const entityQuery = extractCompanyQuery(route)
    if (!entityQuery) {
      return NextResponse.json({
        ...baseResponse(route),
        answer: {
          status: 'needs_entity',
          summary: 'Indica una empresa o RUT de forma explícita para analizar evidencia operacional.',
          unknowns: ['No pude separar de forma segura la intención y la entidad de la consulta.'],
          nextActions: [{ label: 'Abrir Subcontratistas', href: '/dashboard/company/subcontratistas' }],
        },
        evidence: [],
      })
    }

    const candidates = await searchCompany(supabase, entityQuery)

    if (candidates.length === 0) {
      return NextResponse.json({
        ...baseResponse(route),
        entityQuery,
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
        entityQuery,
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
        entityQuery,
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
        entityQuery,
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
          { kind: 'document_set', source: 'subcontractor_documents', entityId: company.id, currentOnly: true, count: documents.length },
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
      entityType: 'company',
      readOnly: true,
    })

    return NextResponse.json({
      ...baseResponse(route),
      entityQuery,
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
        { kind: 'compliance_observation', source: 'subcontractor_documents', entityId: company.id, scope: compliance.scope, currentOnly: true, counts: compliance.counts },
      ],
    })
  } catch (error) {
    console.error('[ChileFlota Intelligence Core] request failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'No se pudo resolver la consulta operacional' }, { status: 500 })
  }
}
