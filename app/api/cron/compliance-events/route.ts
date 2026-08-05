import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

type ComplianceEvent = {
  id: string
  event_type: string
  entity_type: string
  entity_ref: string
  organization_id: string | null
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

async function completeEvents(
  ids: string[],
  status: 'processed' | 'failed' | 'ignored',
  error?: string,
): Promise<void> {
  if (ids.length === 0) return
  const supabase = createAdminClient()
  const { error: rpcError } = await supabase.rpc('complete_compliance_events', {
    p_ids: ids,
    p_status: status,
    p_error: error ?? null,
  })
  if (rpcError) throw new Error(`Could not complete compliance events: ${rpcError.message}`)
}

async function runRpc(name: string): Promise<unknown> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc(name)
  if (error) throw new Error(`${name} failed: ${error.message}`)
  return data
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()
  const { data, error: claimError } = await supabase.rpc('claim_compliance_events', { p_limit: 100 })

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 })
  }

  const events = (data ?? []) as ComplianceEvent[]
  if (events.length === 0) {
    return NextResponse.json({ processed: 0, reason: 'no_pending_events', durationMs: Date.now() - startedAt })
  }

  const relevant: ComplianceEvent[] = []
  const ignored: ComplianceEvent[] = []

  for (const event of events) {
    const isDocumentEvent = event.event_type.startsWith('document.')
    const isEvidenceEvent = event.event_type === 'evidence.created'
    if (isDocumentEvent || isEvidenceEvent) relevant.push(event)
    else ignored.push(event)
  }

  try {
    if (ignored.length > 0) {
      await completeEvents(ignored.map((event) => event.id), 'ignored')
    }

    const results: Record<string, unknown> = {}
    if (relevant.length > 0) {
      const hasDocumentEvents = relevant.some((event) => event.event_type.startsWith('document.'))
      if (hasDocumentEvents) {
        results.documentFacts = await runRpc('sync_subcontractor_document_facts')
        results.companyFacts = await runRpc('sync_company_period_facts_from_documents')
      }
      results.intelligence = await runRpc('run_compliance_intelligence_sync')
      await completeEvents(relevant.map((event) => event.id), 'processed')
    }

    return NextResponse.json({
      claimed: events.length,
      processed: relevant.length,
      ignored: ignored.length,
      entityCount: new Set(relevant.map((event) => `${event.entity_type}:${event.entity_ref}`)).size,
      results,
      durationMs: Date.now() - startedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown compliance event processing error'
    await completeEvents(relevant.map((event) => event.id), 'failed', message).catch(() => undefined)
    return NextResponse.json({ error: message, claimed: events.length }, { status: 500 })
  }
}
