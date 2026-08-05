import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const [summaryResult, attentionResult, decisionsResult] = await Promise.all([
    supabase.from('compliance_executive_summary').select('*').single(),
    supabase
      .from('compliance_attention_queue')
      .select('*')
      .order('priority_score', { ascending: false })
      .order('period_start', { ascending: false })
      .limit(100),
    supabase
      .from('company_period_decisions_current')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(100),
  ])

  const firstError = summaryResult.error ?? attentionResult.error ?? decisionsResult.error
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 })
  }

  return NextResponse.json({
    summary: summaryResult.data,
    attention: attentionResult.data ?? [],
    recentCompanyPeriodDecisions: decisionsResult.data ?? [],
    generatedAt: new Date().toISOString(),
  })
}
