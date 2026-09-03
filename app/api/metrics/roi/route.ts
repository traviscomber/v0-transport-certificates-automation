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

  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(url, key)
}

function hasAccess(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value
  const userRole = request.cookies.get('user_role')?.value?.toLowerCase()

  if (userEmail && userRole && ACCESS_ROLES.has(userRole)) {
    return true
  }

  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const accessKey = process.env.ROI_METRICS_ACCESS_KEY

  if (accessKey && bearerToken === accessKey) {
    return true
  }

  return false
}

function normalizeFilename(value: string | null | undefined) {
  return value?.trim().toLowerCase() || ''
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
      query = query
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())
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
      query = query
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())
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
    if (!hasAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    const url = new URL(request.url)
    const month = url.searchParams.get('month') || ALL_VALUE
    const year = url.searchParams.get('year') || ALL_VALUE
    const range = getMonthYearRange(month, year)

    const [canonicalDocs, legacyDocs, driversResult, organizationsResult, executivesResult] = await Promise.all([
      fetchCanonicalDocuments(supabase, range),
      fetchLegacyDocuments(supabase, range),
      supabase.from('drivers').select('id'),
      supabase.from('organizations').select('id'),
      supabase.from('executive_staff').select('id, full_name').eq('is_active', true),
    ])

    // `subcontractor_documents` is the canonical operational store. `uploaded_documents`
    // is the legacy store used at the beginning of the application. Exact filename
    // matches are migration duplicates, so keep only legacy rows that are not already
    // represented in the canonical store.
    const canonicalFilenameKeys = new Set(
      canonicalDocs.map((doc) => normalizeFilename(doc.file_name)).filter(Boolean),
    )
    const uniqueLegacyDocs = legacyDocs.filter((doc) => {
      const key = normalizeFilename(doc.original_filename)
      return !key || !canonicalFilenameKeys.has(key)
    })

    const totalDocuments = canonicalDocs.length + uniqueLegacyDocs.length
    const canonicalHistoricalDocuments = canonicalDocs.filter((doc) => doc.is_current === false).length
    const currentDocuments = canonicalDocs.filter((doc) => doc.is_current === true).length
    const legacyDocuments = uniqueLegacyDocs.length

    const processedCanonical = canonicalDocs.filter(canonicalWasProcessed).length
    const processedLegacy = uniqueLegacyDocs.filter(legacyWasProcessed).length
    const processingCompletedDocuments = processedCanonical + processedLegacy
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

    const driversData = driversResult.data || []
    const orgsData = organizationsResult.data || []
    const executives = executivesResult.data || []

    const AVG_MANUAL_REVIEW_MINUTES = 13.5
    const AVG_AI_ANALYSIS_MINUTES = 1.5
    const AVG_VALIDATION_MINUTES = 9
    const TOTAL_MANUAL_PER_DOC = AVG_MANUAL_REVIEW_MINUTES
    const TOTAL_WITH_AI_PER_DOC = AVG_AI_ANALYSIS_MINUTES + AVG_VALIDATION_MINUTES

    const timeSavedPerDocMinutes = TOTAL_MANUAL_PER_DOC - TOTAL_WITH_AI_PER_DOC
    const totalTimeSavedMinutes = docsWithAI * timeSavedPerDocMinutes
    const totalTimeSavedHours = totalTimeSavedMinutes / 60
    const totalTimeSavedDays = totalTimeSavedHours / 8

    const WORKING_HOURS_DAILY = 8
    const WORKING_DAYS_MONTHLY = 20
    const WORKING_HOURS_MONTHLY = WORKING_HOURS_DAILY * WORKING_DAYS_MONTHLY
    const WORKING_HOURS_YEARLY = WORKING_HOURS_MONTHLY * 12

    const docsPerExecutiveMonthly = (WORKING_HOURS_MONTHLY * 60) / TOTAL_MANUAL_PER_DOC
    const docsPerExecutiveYearly = (WORKING_HOURS_YEARLY * 60) / TOTAL_MANUAL_PER_DOC
    const executivesEquivalent = Math.round((totalTimeSavedHours / WORKING_HOURS_MONTHLY) * 100) / 100

    const EXECUTIVE_MONTHLY_SALARY = 2500000
    const EXECUTIVE_ANNUAL_SALARY = EXECUTIVE_MONTHLY_SALARY * 12
    const TOTAL_EXECUTIVE_PAYROLL = (executives.length || 5) * EXECUTIVE_MONTHLY_SALARY
    const monthlySavingsFromAI = executivesEquivalent * EXECUTIVE_MONTHLY_SALARY
    const yearlySavingsFromAI = executivesEquivalent * EXECUTIVE_ANNUAL_SALARY

    const systemAccuracy = totalDocuments > 0 ? Math.round((approvedDocs / totalDocuments) * 100) : 0
    const rejectionRate = totalDocuments > 0 ? Math.round((rejectedDocs / totalDocuments) * 100) : 0
    const approvalRate = systemAccuracy

    const processingSpeedAI = Math.round((60 / AVG_AI_ANALYSIS_MINUTES) * 10) / 10
    const processingSpeedManual = Math.round((60 / TOTAL_MANUAL_PER_DOC) * 10) / 10
    const speedMultiplier = Math.round((processingSpeedAI / processingSpeedManual) * 10) / 10

    const totalConductores = driversData.length || 235
    const totalTransportistas = orgsData.length || 235
    const avgDocsPerConductor = totalConductores > 0 ? totalDocuments / totalConductores : 0
    const avgDocsPerTransportista = totalTransportistas > 0 ? totalDocuments / totalTransportistas : 0

    const aiProcessedSuccessfully = Math.max(docsWithAI - aiRejectedDocs, 0)
    const aiSuccessRate = docsWithAI > 0 ? Math.round((aiProcessedSuccessfully / docsWithAI) * 100) : 100

    return NextResponse.json({
      // LIFETIME / PERIOD DOCUMENT ACCOUNTING
      totalDocumentsLifetime: totalDocuments,
      totalDocumentsProcessed: processingCompletedDocuments,
      documentsProcessingCompleted: processingCompletedDocuments,
      documentsAwaitingProcessing: processingPendingDocuments,
      documentsCurrent: currentDocuments,
      documentsHistorical: canonicalHistoricalDocuments,
      documentsLegacy: legacyDocuments,
      canonicalDocuments: canonicalDocs.length,
      legacyMigrationDuplicatesExcluded: legacyDocs.length - uniqueLegacyDocs.length,

      // DOCUMENT MIX
      documentsWithAI: docsWithAI,
      documentsManual: docsManual,
      documentsPending: pendingDocs,
      documentsApproved: approvedDocs,
      documentsRejected: rejectedDocs,

      // TIME SAVINGS
      totalTimeSavedMinutes,
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 100) / 100,
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 100) / 100,
      timeSavedPerDocumentMinutes: timeSavedPerDocMinutes,
      averageTimePerDocumentMinutesManual: TOTAL_MANUAL_PER_DOC,
      averageTimePerDocumentMinutesWithAI: TOTAL_WITH_AI_PER_DOC,

      // EXECUTIVE CAPACITY
      totalExecutives: executives.length || 5,
      executiveNames: executives.map((e) => e.full_name),
      docsPerExecutiveMonthly: Math.round(docsPerExecutiveMonthly),
      docsPerExecutiveYearly: Math.round(docsPerExecutiveYearly),

      // COST SAVINGS
      executivesEquivalent: Math.round(executivesEquivalent * 100) / 100,
      executiveMonthlysalary: EXECUTIVE_MONTHLY_SALARY,
      executiveAnnualSalary: EXECUTIVE_ANNUAL_SALARY,
      totalExecutivePayroll: TOTAL_EXECUTIVE_PAYROLL,
      costSavingMonthly: Math.round(monthlySavingsFromAI),
      costSavingAnnual: Math.round(yearlySavingsFromAI),
      costSavingAsPercentageOfPayroll:
        TOTAL_EXECUTIVE_PAYROLL > 0 ? Math.round((monthlySavingsFromAI / TOTAL_EXECUTIVE_PAYROLL) * 100) : 0,

      // PERFORMANCE METRICS
      systemAccuracy,
      aiSuccessRate,
      rejectionRate,
      approvalRate,
      processingSpeedAI,
      processingSpeedManual,
      speedMultiplier,

      // VOLUME CONTEXT
      totalConductores,
      totalTransportistas,
      averageDocsPerConductor: Math.round(avgDocsPerConductor * 100) / 100,
      averageDocsPerTransportista: Math.round(avgDocsPerTransportista * 100) / 100,

      // ROI SUMMARY
      roi: {
        message: `Labbe puede prescindir de ${Math.round(executivesEquivalent)} ejecutivas y ahorrar CLP $${Math.round(yearlySavingsFromAI).toLocaleString('es-CL')} anualmente.`,
        equivalentExecutives: Math.round(executivesEquivalent * 100) / 100,
        monthlySavingsCLP: Math.round(monthlySavingsFromAI),
        yearlySavingsCLP: Math.round(yearlySavingsFromAI),
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
