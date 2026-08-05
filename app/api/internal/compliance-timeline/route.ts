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

  const entityType = request.nextUrl.searchParams.get('entityType')?.trim()
  const entityRef = request.nextUrl.searchParams.get('entityRef')?.trim()
  const limitValue = Number(request.nextUrl.searchParams.get('limit') ?? '100')
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.floor(limitValue), 1), 500) : 100

  if (!entityType || !entityRef) {
    return NextResponse.json({ error: 'entityType and entityRef are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const [{ data: timeline, error: timelineError }, { data: decision, error: decisionError }] = await Promise.all([
    supabase
      .from('compliance_entity_timeline')
      .select('id,event_type,entity_type,entity_ref,payload,metadata,occurred_at,source_table,source_record_id')
      .eq('entity_type', entityType)
      .eq('entity_ref', entityRef)
      .order('occurred_at', { ascending: false })
      .limit(limit),
    supabase
      .from('operational_decisions')
      .select('id,decision,score,reason_codes,explanation,valid_from,valid_until,is_current,evidence_ids')
      .eq('entity_type', entityType)
      .eq('entity_ref', entityRef)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (timelineError) return NextResponse.json({ error: timelineError.message }, { status: 500 })
  if (decisionError) return NextResponse.json({ error: decisionError.message }, { status: 500 })

  return NextResponse.json({
    entity: { type: entityType, ref: entityRef },
    currentDecision: decision ?? null,
    events: timeline ?? [],
    count: timeline?.length ?? 0,
    generatedAt: new Date().toISOString(),
  })
}
