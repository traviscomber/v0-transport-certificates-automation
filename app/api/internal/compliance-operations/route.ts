import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const hasInternalSecret = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
  const hasApplicationSession = Boolean(request.cookies.get('user_email')?.value)
  return hasInternalSecret || hasApplicationSession
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyRef = request.nextUrl.searchParams.get('companyRef')?.trim() || ''
  const period = request.nextUrl.searchParams.get('period')?.trim() || ''
  const supabase = createAdminClient()

  let workerQuery = supabase
    .from('company_worker_reconciliation_summary')
    .select('*')
    .order('period_start', { ascending: false })
    .limit(companyRef ? 24 : 100)

  if (companyRef) workerQuery = workerQuery.eq('company_entity_ref', companyRef)
  if (period) workerQuery = workerQuery.eq('period_start', period)

  let ocrQuery = supabase
    .from('document_ocr_priority_current')
    .select('document_id, company_ref, subcontractor_rut, file_name, period_start, inferred_document_type, impact_priority, processing_action, attempts, error_message, created_at')
    .order('impact_priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100)

  if (companyRef) ocrQuery = ocrQuery.eq('company_ref', companyRef)

  let vehicleQuery = supabase
    .from('company_vehicle_document_status')
    .select('*')
    .limit(companyRef ? 1 : 100)

  if (companyRef) vehicleQuery = vehicleQuery.eq('company_ref', companyRef)

  const [workerResult, ocrResult, vehicleResult] = await Promise.all([
    workerQuery,
    ocrQuery,
    vehicleQuery,
  ])

  const error = workerResult.error ?? ocrResult.error ?? vehicleResult.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ocrItems = ocrResult.data ?? []
  const ocrSummary = ocrItems.reduce<Record<string, number>>((acc, item) => {
    const key = item.inferred_document_type || 'other'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    companyRef: companyRef || null,
    period: period || null,
    workerPeriods: workerResult.data ?? [],
    ocr: {
      summary: ocrSummary,
      items: ocrItems,
    },
    vehicles: vehicleResult.data ?? [],
    generatedAt: new Date().toISOString(),
  })
}
