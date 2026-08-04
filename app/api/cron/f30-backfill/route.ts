import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const BATCH_SIZE = 4
const PAUSE_MS = 1_500
const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://transn3uralia.vercel.app'
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
  const { data: pending, error } = await supabase
    .from('subcontractor_documents')
    .select('id, file_name, uploaded_at')
    .is('f30_status', null)
    .or('file_name.ilike.F30%,file_name.ilike.F 30%')
    .order('uploaded_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ status: 'complete', processed: 0, remaining: 0 })
  }

  const results: Array<Record<string, unknown>> = []

  for (let index = 0; index < pending.length; index += 1) {
    const document = pending[index]
    if (index > 0) await sleep(PAUSE_MS)

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
        results.push({ id: document.id, fileName: document.file_name, status: 'analysis_failed', error: message })
        continue
      }

      results.push({
        id: document.id,
        fileName: document.file_name,
        status: payload?.f30?.status ?? 'processed',
        saved: payload?.saved ?? false,
        periodConflict: payload?.periodConflict ?? false,
      })
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
      results.push({ id: document.id, fileName: document.file_name, status: 'analysis_failed', error: message })
    }
  }

  const { count: remaining } = await supabase
    .from('subcontractor_documents')
    .select('id', { count: 'exact', head: true })
    .is('f30_status', null)
    .or('file_name.ilike.F30%,file_name.ilike.F 30%')

  return NextResponse.json({
    status: 'processed',
    batchSize: BATCH_SIZE,
    processed: results.length,
    remaining: remaining ?? null,
    results,
  })
}
