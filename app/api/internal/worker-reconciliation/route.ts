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

  const companyRef = request.nextUrl.searchParams.get('companyRef')?.trim()
  const period = request.nextUrl.searchParams.get('period')?.trim()
  const state = request.nextUrl.searchParams.get('state')?.trim()

  if (!companyRef) {
    return NextResponse.json({ error: 'companyRef is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  let query = supabase
    .from('worker_reconciliation_current')
    .select('*')
    .eq('company_entity_ref', companyRef)
    .order('period_start', { ascending: false })
    .order('worker_name', { ascending: true })
    .limit(1000)

  if (period) query = query.eq('period_start', period)
  if (state) query = query.eq('verification_state', state)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const workers = data ?? []
  const summary = workers.reduce(
    (acc, worker) => {
      acc.total += 1
      if (worker.verification_state === 'verified') acc.verified += 1
      else if (worker.verification_state === 'review_required') acc.reviewRequired += 1
      else if (worker.verification_state === 'partial_evidence') acc.partialEvidence += 1
      else acc.insufficientData += 1
      return acc
    },
    { total: 0, verified: 0, reviewRequired: 0, partialEvidence: 0, insufficientData: 0 },
  )

  return NextResponse.json({
    companyRef,
    period: period ?? null,
    summary,
    workers,
    generatedAt: new Date().toISOString(),
  })
}
