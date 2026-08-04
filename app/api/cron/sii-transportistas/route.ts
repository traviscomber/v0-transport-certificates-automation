import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const BATCH_SIZE = 5
const PAUSE_MS = 3_000
const SUCCESS_STATUSES = new Set(['success', 'warning', 'not_found'])
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: circuit } = await supabase
    .from('external_verification_circuit_state')
    .select('state, retry_after, consecutive_failures')
    .eq('source_code', 'sii_tax_status')
    .single()

  if (circuit?.state === 'open' && circuit.retry_after && new Date(circuit.retry_after) > new Date()) {
    return NextResponse.json({ status: 'cooldown', retryAfter: circuit.retry_after })
  }

  const [{ data: transportistas, error: transportistasError }, { data: completedRuns, error: runsError }] = await Promise.all([
    supabase.from('transportistas').select('id, rut, razon_social, is_active').not('rut', 'is', null).order('id'),
    supabase
      .from('external_verification_runs')
      .select('entity_id, status')
      .eq('source_code', 'sii_tax_status')
      .eq('entity_type', 'transportista')
      .in('status', [...SUCCESS_STATUSES]),
  ])

  if (transportistasError || runsError) {
    return NextResponse.json({ error: transportistasError?.message ?? runsError?.message }, { status: 500 })
  }

  const completedIds = new Set((completedRuns ?? []).map((run) => run.entity_id).filter(Boolean))
  const pending = (transportistas ?? []).filter((item) => !completedIds.has(item.id)).slice(0, BATCH_SIZE)

  if (pending.length === 0) return NextResponse.json({ status: 'complete', processed: 0, remaining: 0 })

  const results = []
  for (let index = 0; index < pending.length; index += 1) {
    const item = pending[index]
    if (index > 0) await sleep(PAUSE_MS)

    try {
      const verification = await runExternalVerification({
        sourceCode: 'sii_tax_status',
        entityType: 'transportista',
        entityId: item.id,
        payload: { rut: item.rut, adapterVersion: 3 },
      })
      results.push({ id: item.id, rut: item.rut, status: verification.result.status, runId: verification.runId })

      if (verification.result.errorCode === 'SII_RATE_LIMITED' || verification.result.httpStatus === 429) break
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      results.push({ id: item.id, rut: item.rut, status: 'failed', error: message })
      if (message.includes('circuit is open')) break
    }
  }

  const successfulNow = results.filter((item) => SUCCESS_STATUSES.has(item.status)).length
  return NextResponse.json({
    status: 'processed',
    processed: results.length,
    successful: successfulNow,
    remaining: Math.max(0, (transportistas ?? []).length - completedIds.size - successfulNow),
    results,
  })
}
