import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type LatestRun = {
  entity_id: string
  status: string
  normalized_result: Record<string, unknown> | null
  error_code: string | null
  error_message: string | null
  completed_at: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value
  if (!userEmail) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createAdminClient()
  const [{ data, error }, { count: total, error: totalError }] = await Promise.all([
    supabase
      .from('external_verification_runs')
      .select('entity_id,status,normalized_result,error_code,error_message,completed_at,created_at')
      .eq('source_code', 'sii_tax_status')
      .eq('entity_type', 'transportista')
      .order('created_at', { ascending: false }),
    supabase
      .from('transportistas')
      .select('id', { count: 'exact', head: true })
      .not('rut', 'is', null),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (totalError) return NextResponse.json({ error: totalError.message }, { status: 500 })

  const latestByEntity = new Map<string, LatestRun>()
  for (const run of (data ?? []) as LatestRun[]) {
    if (run.entity_id && !latestByEntity.has(run.entity_id)) latestByEntity.set(run.entity_id, run)
  }

  const statuses = Object.fromEntries(
    Array.from(latestByEntity.entries()).map(([entityId, run]) => {
      const normalized = run.normalized_result ?? {}
      return [entityId, {
        status: run.status,
        errorCode: run.error_code,
        errorMessage: run.error_message,
        checkedAt: run.completed_at ?? run.created_at,
        razonSocial: typeof normalized.razonSocial === 'string' ? normalized.razonSocial : null,
        warningReasons: Array.isArray(normalized.warningReasons) ? normalized.warningReasons : [],
      }]
    })
  )

  const runs = Array.from(latestByEntity.values())
  const running = runs.filter((run) => run.status === 'running').length
  const successful = runs.filter((run) => run.status === 'success').length
  const warnings = runs.filter((run) => run.status === 'warning').length
  const notFound = runs.filter((run) => run.status === 'not_found').length
  const blocked = runs.filter((run) => run.status === 'blocked').length
  const failed = runs.filter((run) => run.status === 'failed').length
  const processed = successful + warnings + notFound + blocked + failed
  const totalCount = total ?? 0
  const pending = Math.max(totalCount - processed - running, 0)
  const percentage = totalCount > 0 ? Math.min(Math.round((processed / totalCount) * 100), 100) : 0

  return NextResponse.json({
    statuses,
    summary: {
      total: totalCount,
      processed,
      pending,
      running,
      successful,
      warnings,
      failed,
      notFound,
      blocked,
      percentage,
      updatedAt: new Date().toISOString(),
    },
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
  })
}
