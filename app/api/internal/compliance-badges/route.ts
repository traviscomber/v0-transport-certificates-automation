import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type BadgeState = 'verified' | 'warning' | 'blocked' | 'pending' | 'unknown'

type Badge = {
  code: string
  label: string
  state: BadgeState
  summary: string
  value?: number | string | null
  reasonCodes: string[]
  evidence: Record<string, unknown>
}

const VEHICLE_DOCUMENT_CODES = [
  'SOAP',
  'SEGURO-SOAP',
  'PADRON',
  'PADRON-VEHICULO',
  'PERMISO_CIRCULACION',
  'PERMISO-CIRCULACION',
  'REVISION_TECNICA',
  'REVISION-TECNICA',
]

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const hasInternalSecret = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
  const hasApplicationSession = Boolean(request.cookies.get('user_email')?.value)
  return hasInternalSecret || hasApplicationSession
}

function operationalState(decision?: string | null): BadgeState {
  if (decision === 'enabled') return 'verified'
  if (decision === 'warning') return 'warning'
  if (decision === 'blocked') return 'blocked'
  return 'unknown'
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyRef = request.nextUrl.searchParams.get('companyRef')?.trim()
  const requestedPeriod = request.nextUrl.searchParams.get('period')?.trim()

  if (!companyRef) {
    return NextResponse.json({ error: 'companyRef is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const companyDecisionQuery = supabase
    .from('operational_decisions')
    .select('decision, score, reason_codes, evidence_ids, explanation, created_at')
    .eq('entity_type', 'transportista')
    .eq('entity_ref', companyRef)
    .eq('is_current', true)
    .maybeSingle()

  let periodQuery = supabase
    .from('company_period_decisions_current')
    .select('*')
    .eq('company_entity_ref', companyRef)
    .order('period_start', { ascending: false })
    .limit(1)

  if (requestedPeriod) periodQuery = periodQuery.eq('period_start', requestedPeriod)

  const [companyResult, periodResult, vehicleTypeResult] = await Promise.all([
    companyDecisionQuery,
    periodQuery.maybeSingle(),
    supabase
      .from('document_types')
      .select('id, code')
      .in('code', VEHICLE_DOCUMENT_CODES)
      .eq('is_active', true),
  ])

  const firstError = companyResult.error ?? periodResult.error ?? vehicleTypeResult.error
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 })
  }

  const vehicleTypeIds = (vehicleTypeResult.data ?? []).map((item) => item.id)
  let suppliedVehicleDocuments = 0

  if (vehicleTypeIds.length > 0) {
    const vehicleDocumentsResult = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact', head: true })
      .eq('subcontractor_id', companyRef)
      .in('document_type_id', vehicleTypeIds)
      .eq('is_current', true)

    if (vehicleDocumentsResult.error) {
      return NextResponse.json({ error: vehicleDocumentsResult.error.message }, { status: 500 })
    }

    suppliedVehicleDocuments = vehicleDocumentsResult.count ?? 0
  }

  const company = companyResult.data
  const period = periodResult.data
  const companyReasons = (company?.reason_codes ?? []) as string[]
  const periodReasons = (period?.reason_codes ?? []) as string[]

  const expectedWorkers = Number(period?.expected_workers ?? 0)
  const previredWorkers = Number(period?.previred_workers ?? 0)
  const liquidationWorkers = Number(period?.liquidation_workers ?? 0)
  const contractWorkers = Number(period?.contract_workers ?? 0)
  const missingPrevired = Number(period?.missing_in_previred ?? 0)
  const missingLiquidations = Number(period?.missing_liquidations ?? 0)
  const missingContracts = Number(period?.missing_contracts ?? 0)

  const hasSiiFailure = companyReasons.some((code) => code.includes('sii') || code.includes('tax'))
  const siiState: BadgeState = !company
    ? 'unknown'
    : company.decision === 'blocked' && hasSiiFailure
      ? 'blocked'
      : hasSiiFailure
        ? 'warning'
        : 'verified'

  const reconciliationState: BadgeState = !period
    ? 'unknown'
    : period.reconciliation_status === 'matched' || period.reconciliation_status === 'complete'
      ? 'verified'
      : period.decision === 'blocked'
        ? 'blocked'
        : period.decision === 'unknown'
          ? 'pending'
          : 'warning'

  const previredState: BadgeState = !period
    ? 'unknown'
    : expectedWorkers <= 0
      ? 'pending'
      : missingPrevired === 0 && previredWorkers >= expectedWorkers
        ? 'verified'
        : missingPrevired > 0
          ? 'blocked'
          : 'warning'

  const requiredSources = [
    expectedWorkers > 0,
    Number(period?.f30_workers ?? 0) > 0,
    previredWorkers > 0,
    liquidationWorkers > 0,
    contractWorkers > 0,
  ]
  const documentationCoverage = Math.round((requiredSources.filter(Boolean).length / requiredSources.length) * 100)
  const documentationState: BadgeState = !period
    ? 'unknown'
    : documentationCoverage === 100 && missingLiquidations === 0 && missingContracts === 0
      ? 'verified'
      : documentationCoverage >= 60
        ? 'warning'
        : 'pending'

  const workerMissingTotal = missingPrevired + missingLiquidations + missingContracts
  const workersState: BadgeState = !period
    ? 'unknown'
    : expectedWorkers <= 0
      ? 'pending'
      : workerMissingTotal === 0
        ? 'verified'
        : missingPrevired > 0
          ? 'blocked'
          : 'warning'

  const badges: Badge[] = [
    {
      code: 'sii_verified',
      label: 'SII Verificado',
      state: siiState,
      summary: siiState === 'verified' ? 'Empresa validada con evidencia tributaria vigente.' : 'La validación tributaria requiere revisión.',
      value: company?.score ?? null,
      reasonCodes: companyReasons,
      evidence: { evidenceIds: company?.evidence_ids ?? [], verifiedAt: company?.created_at ?? null },
    },
    {
      code: 'workforce_reconciled',
      label: 'Dotación Conciliada',
      state: reconciliationState,
      summary: period ? `${expectedWorkers} trabajadores esperados para el período.` : 'No existe un período conciliado.',
      value: expectedWorkers,
      reasonCodes: periodReasons,
      evidence: {
        period: period?.period_start ?? null,
        f30Workers: period?.f30_workers ?? 0,
        previredWorkers,
        liquidationWorkers,
        contractWorkers,
      },
    },
    {
      code: 'previred_complete',
      label: 'Previred Completo',
      state: previredState,
      summary: expectedWorkers > 0 ? `${previredWorkers}/${expectedWorkers} trabajadores con respaldo previsional.` : 'Sin dotación suficiente para evaluar.',
      value: expectedWorkers > 0 ? Math.round((previredWorkers / expectedWorkers) * 100) : null,
      reasonCodes: missingPrevired > 0 ? ['missing_in_previred'] : [],
      evidence: { period: period?.period_start ?? null, expectedWorkers, previredWorkers, missingPrevired },
    },
    {
      code: 'documentation_complete',
      label: 'Documentación Completa',
      state: documentationState,
      summary: `${documentationCoverage}% de cobertura de fuentes laborales requeridas.`,
      value: documentationCoverage,
      reasonCodes: [
        ...(missingLiquidations > 0 ? ['missing_liquidations'] : []),
        ...(missingContracts > 0 ? ['missing_contracts'] : []),
      ],
      evidence: { period: period?.period_start ?? null, missingLiquidations, missingContracts },
    },
    {
      code: 'workers_verified',
      label: 'Trabajadores Verificados',
      state: workersState,
      summary: workerMissingTotal === 0 ? 'No se detectaron faltantes entre las fuentes disponibles.' : `${workerMissingTotal} faltantes acumulados requieren revisión.`,
      value: expectedWorkers,
      reasonCodes: [
        ...(missingPrevired > 0 ? ['missing_in_previred'] : []),
        ...(missingLiquidations > 0 ? ['missing_liquidations'] : []),
        ...(missingContracts > 0 ? ['missing_contracts'] : []),
      ],
      evidence: { period: period?.period_start ?? null, expectedWorkers, missingPrevired, missingLiquidations, missingContracts },
    },
  ]

  if (suppliedVehicleDocuments > 0) {
    badges.push({
      code: 'vehicles_verified',
      label: 'Vehículos Verificados',
      state: 'pending',
      summary: `${suppliedVehicleDocuments} documento${suppliedVehicleDocuments === 1 ? '' : 's'} vehicular${suppliedVehicleDocuments === 1 ? '' : 'es'} aportado${suppliedVehicleDocuments === 1 ? '' : 's'}; validación en proceso.`,
      value: suppliedVehicleDocuments,
      reasonCodes: ['vehicle_documents_require_validation'],
      evidence: { canonicalSource: 'prt', suppliedDocuments: suppliedVehicleDocuments },
    })
  }

  badges.push({
    code: 'operational_status',
    label: 'Estado Operacional',
    state: operationalState(company?.decision),
    summary: company?.explanation ?? 'No existe una decisión operacional vigente.',
    value: company?.score ?? null,
    reasonCodes: companyReasons,
    evidence: { evidenceIds: company?.evidence_ids ?? [], decision: company?.decision ?? null, createdAt: company?.created_at ?? null },
  })

  return NextResponse.json({
    companyRef,
    period: period?.period_start ?? requestedPeriod ?? null,
    badges,
    generatedAt: new Date().toISOString(),
  })
}
