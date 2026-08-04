import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const BATCH_SIZE = 20
const CONCURRENCY = 4
const LOCK_NAME = 'f30_backfill'
const LOCK_LEASE_SECONDS = 360
const F30_TYPE_CODES = ['F30', 'F30-1_CLIENTE', 'F30-1_DOÑA_ISIDORA']
const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://transn3uralia.vercel.app'

function isAuthorizedCron(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization')
  const configuredSecret = process.env.CRON_SECRET
  const hasValidSecret = Boolean(configuredSecret && authorization === `Bearer ${configuredSecret}`)
  const isVercelCron = request.headers.get('user-agent') === 'vercel-cron/1.0'
  return hasValidSecret || isVercelCron
}

async function getF30TypeIds(supabase: ReturnType<typeof createAdminClient>): Promise<string[]> {
  const { data, error } = await supabase
    .from('subcontractor_document_types')
    .select('id, code')
    .in('code', F30_TYPE_CODES)
    .eq('is_active', true)

  if (error) throw new Error(`Unable to resolve F30 document types: ${error.message}`)
  return (data ?? []).map((row) => row.id)
}

function buildF30Filter(typeIds: string[]): string {
  const filters = ['file_name.ilike.F30%', 'file_name.ilike.F 30%']
  if (typeIds.length > 0) filters.push(`document_type_id.in.(${typeIds.join(',')})`)
  return filters.join(',')
}

async function processDocument(
  document: { id: string; file_name: string | null },
  supabase: ReturnType<typeof createAdminClient>,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${PRODUCTION_ORIGIN}/api/company/documents/${document.id}/reprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: document.id, source: 'f30_backfill' }),
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok || payload?.success !== true) {
      const message = payload?.error || `HTTP ${response.status}`
      await supabase
        .from('subcontractor_documents')
        .update({
          f30_status: 'analysis_failed',
          f30_details: { detected: false, warnings: ['backfill_failed'], error: message },
          f30_validated_at: new Date().toISOString(),
        })
        .eq('id', document.id)

      return { id: document.id, fileName: document.file_name, status: 'analysis_failed', error: message }
    }

    return {
      id: document.id,
      fileName: document.file_name,
      status: payload?.f30?.status ?? 'processed',
      saved: payload?.saved ?? false,
      periodConflict: payload?.periodConflict ?? false,
      usedOcrFallback: payload?.usedOcrFallback ?? false,
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown backfill error'
    await supabase
      .from('subcontractor_documents')
      .update({
        f30_status: 'analysis_failed',
        f30_details: { detected: false, warnings: ['backfill_failed'], error: message },
        f30_validated_at: new Date().toISOString(),
      })
      .eq('id', document.id)

    return { id: document.id, fileName: document.file_name, status: 'analysis_failed', error: message }
  }
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const ownerToken = randomUUID()
  const { data: acquired, error: lockError } = await supabase.rpc('acquire_system_job_lock', {
    p_job_name: LOCK_NAME,
    p_owner_token: ownerToken,
    p_lease_seconds: LOCK_LEASE_SECONDS,
  })

  if (lockError) {
    return NextResponse.json({ error: `Unable to acquire F30 lock: ${lockError.message}` }, { status: 500 })
  }

  if (!acquired) {
    return NextResponse.json({ status: 'skipped', reason: 'backfill_already_running' })
  }

  try {
    const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    await supabase
      .from('subcontractor_documents')
      .update({ f30_status: null, f30_validated_at: null })
      .eq('f30_status', 'processing')
      .lt('f30_validated_at', staleBefore)

    const f30TypeIds = await getF30TypeIds(supabase)
    const f30Filter = buildF30Filter(f30TypeIds)

    const { data: pending, error } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, uploaded_at')
      .is('f30_status', null)
      .or(f30Filter)
      .order('uploaded_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ status: 'complete', processed: 0, remaining: 0 })
    }

    const claimedAt = new Date().toISOString()
    const claimedIds = pending.map((document) => document.id)
    const { error: claimError } = await supabase
      .from('subcontractor_documents')
      .update({ f30_status: 'processing', f30_validated_at: claimedAt })
      .in('id', claimedIds)
      .is('f30_status', null)

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 })
    }

    const results: Array<Record<string, unknown>> = []

    for (let index = 0; index < pending.length; index += CONCURRENCY) {
      const chunk = pending.slice(index, index + CONCURRENCY)
      const chunkResults = await Promise.all(chunk.map((document) => processDocument(document, supabase)))
      results.push(...chunkResults)
    }

    const { count: remaining } = await supabase
      .from('subcontractor_documents')
      .select('id', { count: 'exact', head: true })
      .is('f30_status', null)
      .or(f30Filter)

    const summary = results.reduce<Record<string, number>>((acc, result) => {
      const status = String(result.status ?? 'unknown')
      const currentCount = acc[status] ?? 0
      acc[status] = currentCount + 1
      return acc
    }, {})

    return NextResponse.json({
      status: 'processed',
      batchSize: BATCH_SIZE,
      concurrency: CONCURRENCY,
      detectedTypeIds: f30TypeIds.length,
      processed: results.length,
      remaining: remaining ?? null,
      durationMs: Date.now() - startedAt,
      summary,
      results,
    })
  } finally {
    const { error: releaseError } = await supabase.rpc('release_system_job_lock', {
      p_job_name: LOCK_NAME,
      p_owner_token: ownerToken,
    })
    if (releaseError) console.error('[f30-backfill] Failed to release lock', releaseError)
  }
}
