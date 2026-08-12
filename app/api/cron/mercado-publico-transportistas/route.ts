import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const SOURCE_CODE = 'mercado_publico_supplier' as const
const BATCH_SIZE = 8
const PAUSE_MS = 750
const ADAPTER_VERSION = 1
const TERMINAL_STATUSES = new Set(['success', 'warning', 'not_found'])
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isAuthorizedCron(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization')
  const configuredSecret = process.env.CRON_SECRET
  const hasValidSecret = Boolean(configuredSecret && authorization === `Bearer ${configuredSecret}`)
  const isVercelCron = request.headers.get('user-agent') === 'vercel-cron/1.0'
  return hasValidSecret || isVercelCron
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: source, error: sourceError } = await supabase
    .from('external_verification_sources')
    .select('is_enabled')
    .eq('code', SOURCE_CODE)
    .single()

  if (sourceError || !source) {
    return NextResponse.json({ error: 'Mercado Publico source is not configured' }, { status: 500 })
  }

  if (!source.is_enabled) {
    return NextResponse.json({
      status: 'disabled',
      sourceCode: SOURCE_CODE,
      processed: 0,
      remaining: null,
      message: 'Mercado Publico remains disabled until its production API ticket is configured.',
    })
  }

  if (!process.env.MERCADO_PUBLICO_API_TICKET?.trim()) {
    return NextResponse.json({
      status: 'configuration_required',
      sourceCode: SOURCE_CODE,
      processed: 0,
      remaining: null,
      error: 'MERCADO_PUBLICO_API_TICKET is not configured',
    }, { status: 503 })
  }

  const [{ data: circuit }, { data: transportistas, error: transportistasError }, { data: completedRuns, error: runsError }] = await Promise.all([
    supabase
      .from('external_verification_circuit_state')
      .select('state, retry_after, consecutive_failures')
      .eq('source_code', SOURCE_CODE)
      .single(),
    supabase
      .from('transportistas')
      .select('id, rut, razon_social, is_active')
      .not('rut', 'is', null)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('external_verification_runs')
      .select('entity_id, status, input_payload')
      .eq('source_code', SOURCE_CODE)
      .eq('entity_type', 'transportista'),
  ])

  if (transportistasError || runsError) {
    return NextResponse.json({ error: transportistasError?.message ?? runsError?.message }, { status: 500 })
  }

  if (circuit?.state === 'open' && circuit.retry_after && new Date(circuit.retry_after) > new Date()) {
    return NextResponse.json({ status: 'cooldown', retryAfter: circuit.retry_after })
  }

  const completedIds = new Set(
    (completedRuns ?? [])
      .filter((run) => {
        const payload = run.input_payload as Record<string, unknown> | null
        return payload?.adapterVersion === ADAPTER_VERSION && TERMINAL_STATUSES.has(run.status)
      })
      .map((run) => run.entity_id)
      .filter(Boolean),
  )

  const pendingAll = (transportistas ?? []).filter((item) => !completedIds.has(item.id))
  const pending = pendingAll.slice(0, BATCH_SIZE)

  if (pending.length === 0) {
    return NextResponse.json({
      status: 'complete',
      sourceCode: SOURCE_CODE,
      adapterVersion: ADAPTER_VERSION,
      processed: 0,
      remaining: 0,
    })
  }

  const results: Array<Record<string, unknown>> = []

  for (let index = 0; index < pending.length; index += 1) {
    if (index > 0) await sleep(PAUSE_MS)
    const item = pending[index]

    try {
      const verification = await runExternalVerification({
        sourceCode: SOURCE_CODE,
        entityType: 'transportista',
        entityId: item.id,
        payload: {
          rut: item.rut,
          razonSocial: item.razon_social,
          adapterVersion: ADAPTER_VERSION,
        },
      })

      results.push({
        id: item.id,
        rut: item.rut,
        status: verification.result.status,
        runId: verification.runId,
        cacheHit: verification.cacheHit,
      })

      if (
        verification.result.errorCode === 'MERCADO_PUBLICO_RATE_LIMITED' ||
        verification.result.httpStatus === 429
      ) break
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Mercado Publico error'
      results.push({ id: item.id, rut: item.rut, status: 'failed', error: message })
      if (message.includes('circuit is open')) break
    }
  }

  const completedNow = results.filter((item) => TERMINAL_STATUSES.has(String(item.status))).length

  return NextResponse.json({
    status: 'processed',
    sourceCode: SOURCE_CODE,
    adapterVersion: ADAPTER_VERSION,
    batchSize: BATCH_SIZE,
    pauseMs: PAUSE_MS,
    processed: results.length,
    successful: completedNow,
    remaining: Math.max(0, pendingAll.length - completedNow),
    results,
  })
}
