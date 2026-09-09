export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ALL_VALUE, getMonthYearRange } from '@/lib/date-filters'

const ACCESS_ROLES = new Set(['admin', 'executive', 'ejecutiva', 'superadmin', 'super_admin'])
const PAGE_SIZE = 1000

type DateRange = ReturnType<typeof getMonthYearRange>

type CanonicalDocument = {
  id: string
  file_name: string | null
  status: string | null
  created_at: string
  ai_analyzed_at: string | null
  ai_extracted_text: string | null
  reviewed_at: string | null
  f30_validated_at: string | null
  is_current: boolean | null
}

type LegacyDocument = {
  id: string
  original_filename: string | null
  validation_status: string | null
  created_at: string
  processed_at: string | null
  ai_processed_at: string | null
  ai_analyzed_at: string | null
  vision_processed_at: string | null
  ai_extracted_text: string | null
  ai_processing_status: string | null
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase configuration')
  return createClient(url, key)
}

function hasAccess(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value
  const userRole = request.cookies.get('user_role')?.value?.toLowerCase()

  if (userEmail && userRole && ACCESS_ROLES.has(userRole)) return true

  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const accessKey = process.env.ROI_METRICS_ACCESS_KEY
  return Boolean(accessKey && bearerToken === accessKey)
}

function normalizeFilename(value: string | null | undefined) {
  return value?.trim().toLowerCase() || ''
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

async function fetchCanonicalDocuments(
  supabase: ReturnType<typeof getSupabaseClient>,
  range: DateRange,
): Promise<CanonicalDocument[]> {
  const rows: CanonicalDocument[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from('subcontractor_documents')
      .select('id,file_name,status,created_at,ai_analyzed_at,ai_extracted_text,reviewed_at,f30_validated_at,is_current')
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (range) {
      query = query.gte('created_at', range.start.toISOString()).lte('created_at', range.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    const page = (data || []) as CanonicalDocument[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  return rows
}

async function fetchLegacyDocuments(
  supabase: ReturnType<typeof getSupabaseClient>,
  range: DateRange,
): Promise<LegacyDocument[]> {
  const rows: LegacyDocument[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from('uploaded_documents')
      .select('id,original_filename,validation_status,created_at,processed_at,ai_processed_at,ai_analyzed_at,vision_processed_at,ai_extracted_text,ai_processing_status')
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (range) {
      query = query.gte('created_at', range.start.toISOString()).lte('created_at', range.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    const page = (data || []) as LegacyDocument[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  return rows
}

function canonicalHasAI(doc: CanonicalDocument) {
  return Boolean(doc.ai_analyzed_at || (doc.ai_extracted_text && doc.ai_extracted_text.trim().length > 0))
}

function legacyHasAI(doc: LegacyDocument) {
  return Boolean(
    doc.ai_processed_at ||
      doc.ai_analyzed_at ||
      doc.vision_processed_at ||
      (doc.ai_extracted_text && doc.ai_extracted_text.trim().length > 0) ||
      doc.ai_processing_status === 'completed',
  )
}

function canonicalWasProcessed(doc: CanonicalDocument) {
  return Boolean(
    doc.status === 'approved' ||
      doc.status === 'rejected' ||
      doc.ai_analyzed_at ||
      doc.reviewed_at ||
      doc.f30_validated_at,
  )
}

function legacyWasProcessed(doc: LegacyDocument) {
  return Boolean(
    doc.validation_status === 'approved' ||
      doc.validation_status === 'rejected' ||
      doc.processed_at ||
      doc.ai_processed_at ||
      doc.ai_analyzed_at ||
      doc.vision_processed_at,
  )
}

export async function GET(request: NextRequest) {
  try {
    if (!hasAccess(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabaseClient()
    const url = new URL(request.url)
    const month = url.searchParams.get('month') || ALL_VALUE
    const year = url.searchParams.get('year') || ALL_VALUE
    const range = getMonthYearRange(month, year)

    const [canonicalDocs, legacyDocs, driversResult, transportistasResult, executivesResult] = await Promise.all([
      fetchCanonicalDocuments(supabase, range),
      fetchLegacyDocuments(supabase, range),
      supabase.from('drivers').select('id'),
      supabase.from('transportistas').select('id'),
      supabase.from('executive_staff').select('id, full_name').eq('is_active', true),
    ])

    if (driversResult.error) throw driversResult.error
    if (transportistasResult.error) throw transportistasResult.error
    if (executivesResult.error) throw executivesResult.error

    const canonicalFilenameKeys = new Set(canonicalDocs.map((doc) => normalizeFilename(doc.file_name)).filter(Boolean))
    const uniqueLegacyDocs = legacyDocs.filter((doc) => {
      const key = normalizeFilename(doc.original_filename)
      return !key || !canonicalFilenameKeys.has(key)
    })

    const totalDocuments = canonicalDocs.length + uniqueLegacyDocs.length
    const currentDocuments = canonicalDocs.filter((doc) => doc.is_current === true).length
    const canonicalHistoricalDocuments = canonicalDocs.filter((doc) => doc.is_current === false).length
    const legacyDocuments = uniqueLegacyDocs.length

    const processingCompletedDocuments =
      canonicalDocs.filter(canonicalWasProcessed).length + uniqueLegacyDocs.filter(legacyWasProcessed).length
    const processingPendingDocuments = Math.max(totalDocuments - processingCompletedDocuments, 0)

    const canonicalWithAI = canonicalDocs.filter(canonicalHasAI)
    const legacyWithAI = uniqueLegacyDocs.filter(legacyHasAI)
    const docsWithAI = canonicalWithAI.length + legacyWithAI.length
    const docsManual = Math.max(totalDocuments - docsWithAI, 0)

    const approvedDocs =
      canonicalDocs.filter((doc) => doc.status === 'approved').length +
      uniqueLegacyDocs.filter((doc) => doc.validation_status === 'approved').length
    const rejectedDocs =
      canonicalDocs.filter((doc) => doc.status === 'rejected').length +
      uniqueLegacyDocs.filter((doc) => doc.validation_status === 'rejected').length
    const pendingDocs = Math.max(totalDocuments - approvedDocs - rejectedDocs, 0)

    const aiRejectedDocs =
      canonicalWithAI.filter((doc) => doc.status === 'rejected').length +
      legacyWithAI.filter((doc) => doc.validation_status === 'rejected').length

    const manualReviewMinutes = positiveNumber(process.env.ROI_MANUAL_REVIEW_MINUTES, 13.5)
    const aiAnalysisMinutes = positiveNumber(process.env.ROI_AI_ANALYSIS_MINUTES, 1.5)
    const humanValidationMinutes = positiveNumber(process.env.ROI_HUMAN_VALIDATION_MINUTES, 9)
    const withAiMinutes = aiAnalysisMinutes + humanValidationMinutes
    const timeSavedPerDocMinutes = Math.max(manualReviewMinutes - withAiMinutes, 0)
    const totalTimeSavedMinutes = docsWithAI * timeSavedPerDocMinutes
    const totalTimeSavedHours = totalTimeSavedMinutes / 60

    const workingHoursMonthly = 8 * 20
    const executivesEquivalent = totalTimeSavedHours / workingHoursMonthly
    const actualExecutiveCount = (executivesResult.data || []).length

    const configuredMonthlyCost = Number(process.env.ROI_EXECUTIVE_MONTHLY_COST_CLP)
    const financialEstimateAvailable = Number.isFinite(configuredMonthlyCost) && configuredMonthlyCost > 0
    const estimatedMonthlySavings = financialEstimateAvailable ? executivesEquivalent * configuredMonthlyCost : null
    const estimatedAnnualSavings = estimatedMonthlySavings === null ? null : estimatedMonthlySavings * 12
    const actualPayroll = financialEstimateAvailable ? actualExecutiveCount * configuredMonthlyCost : null
    const payrollPercentage =
      estimatedMonthlySavings !== null && actualPayroll && actualPayroll > 0
        ? Math.round((estimatedMonthlySavings / actualPayroll) * 100)
        : null

    const approvalRate = totalDocuments > 0 ? Math.round((approvedDocs / totalDocuments) * 100) : 0
    const rejectionRate = totalDocuments > 0 ? Math.round((rejectedDocs / totalDocuments) * 100) : 0
    const aiNonRejectionRate = docsWithAI > 0 ? Math.round(((docsWithAI - aiRejectedDocs) / docsWithAI) * 100) : null

    const processingSpeedAI = Math.round((60 / aiAnalysisMinutes) * 10) / 10
    const processingSpeedManual = Math.round((60 / manualReviewMinutes) * 10) / 10
    const speedMultiplier = processingSpeedManual > 0 ? Math.round((processingSpeedAI / processingSpeedManual) * 10) / 10 : 0

    const totalConductores = (driversResult.data || []).length
    const totalTransportistas = (transportistasResult.data || []).length

    return NextResponse.json({
      totalDocumentsLifetime: totalDocuments,
      totalDocumentsProcessed: processingCompletedDocuments,
      documentsProcessingCompleted: processingCompletedDocuments,
      documentsAwaitingProcessing: processingPendingDocuments,
      documentsCurrent: currentDocuments,
      documentsHistorical: canonicalHistoricalDocuments,
      documentsLegacy: legacyDocuments,
      canonicalDocuments: canonicalDocs.length,
      legacyMigrationDuplicatesExcluded: legacyDocs.length - uniqueLegacyDocs.length,

      documentsWithAI: docsWithAI,
      documentsManual: docsManual,
      documentsPending: pendingDocs,
      documentsApproved: approvedDocs,
      documentsRejected: rejectedDocs,

      totalTimeSavedMinutes,
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 100) / 100,
      totalTimeSavedDays: Math.round((totalTimeSavedHours / 8) * 100) / 100,
      timeSavedPerDocumentMinutes: timeSavedPerDocMinutes,
      averageTimePerDocumentMinutesManual: manualReviewMinutes,
      averageTimePerDocumentMinutesWithAI: withAiMinutes,

      totalExecutives: actualExecutiveCount,
      executiveNames: (executivesResult.data || []).map((executive) => executive.full_name),
      executivesEquivalent: Math.round(executivesEquivalent * 100) / 100,
      docsPerExecutiveMonthly: Math.round((workingHoursMonthly * 60) / manualReviewMinutes),

      financialEstimateAvailable,
      configuredExecutiveMonthlyCostCLP: financialEstimateAvailable ? configuredMonthlyCost : null,
      costSavingMonthly: estimatedMonthlySavings === null ? null : Math.round(estimatedMonthlySavings),
      costSavingAnnual: estimatedAnnualSavings === null ? null : Math.round(estimatedAnnualSavings),
      costSavingAsPercentageOfPayroll: payrollPercentage,

      systemAccuracy: null,
      aiSuccessRate: aiNonRejectionRate,
      rejectionRate,
      approvalRate,
      processingSpeedAI,
      processingSpeedManual,
      speedMultiplier,

      totalConductores,
      totalTransportistas,
      averageDocsPerConductor: totalConductores > 0 ? Math.round((totalDocuments / totalConductores) * 100) / 100 : 0,
      averageDocsPerTransportista: totalTransportistas > 0 ? Math.round((totalDocuments / totalTransportistas) * 100) / 100 : 0,

      scenarioAssumptions: {
        manualReviewMinutes,
        aiAnalysisMinutes,
        humanValidationMinutes,
        source: 'configured-or-default-scenario',
        realizedSavingsClaim: false,
      },

      roi: {
        message: `Escenario: ${Math.round(totalTimeSavedHours).toLocaleString('es-CL')} horas de capacidad estimada liberada con ${docsWithAI.toLocaleString('es-CL')} documentos asistidos por IA.`,
        equivalentExecutives: Math.round(executivesEquivalent * 100) / 100,
        monthlySavingsCLP: estimatedMonthlySavings === null ? null : Math.round(estimatedMonthlySavings),
        yearlySavingsCLP: estimatedAnnualSavings === null ? null : Math.round(estimatedAnnualSavings),
        documentsProcessedPerDay: Math.round(docsWithAI / 30),
        hoursPerMonthSaved: Math.round(totalTimeSavedHours),
      },

      generatedAt: new Date().toISOString(),
      periodMonth: month,
      periodYear: year,
    })
  } catch (error: any) {
    console.error('[v0] ROI Metrics Error:', error.message || error)
    return NextResponse.json(
      { error: 'Error calculating ROI metrics', details: error.message || String(error) },
      { status: 500 },
    )
  }
}
