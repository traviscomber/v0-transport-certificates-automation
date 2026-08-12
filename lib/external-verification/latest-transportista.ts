import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { VerificationSourceCode, VerificationStatus } from './types'

export type LatestTransportistaVerificationSummary = {
  sourceCode: VerificationSourceCode
  status: VerificationStatus
  checkedAt: string | null
  cacheHit: boolean
  confidence: number | null
  normalizedResult: Record<string, unknown> | null
}

function normalizeRut(value: string | null | undefined): string {
  return String(value ?? '').replace(/\./g, '').replace(/\s+/g, '').toUpperCase()
}

export async function getLatestTransportistaVerificationsByRut(
  sourceCode: VerificationSourceCode,
): Promise<Record<string, LatestTransportistaVerificationSummary>> {
  const supabase = createAdminClient()

  const [{ data: transportistas, error: transportistasError }, { data: runs, error: runsError }] = await Promise.all([
    supabase
      .from('transportistas')
      .select('id, rut')
      .not('rut', 'is', null),
    supabase
      .from('external_verification_runs')
      .select('entity_id, status, normalized_result, confidence, cache_hit, started_at, completed_at, created_at')
      .eq('source_code', sourceCode)
      .eq('entity_type', 'transportista')
      .order('created_at', { ascending: false }),
  ])

  if (transportistasError) throw transportistasError
  if (runsError) throw runsError

  const rutById = new Map(
    (transportistas ?? [])
      .filter((item) => item.id && item.rut)
      .map((item) => [item.id, normalizeRut(item.rut)]),
  )

  const summaries: Record<string, LatestTransportistaVerificationSummary> = {}

  for (const run of runs ?? []) {
    if (!run.entity_id) continue
    const rut = rutById.get(run.entity_id)
    if (!rut || summaries[rut]) continue

    summaries[rut] = {
      sourceCode,
      status: run.status as VerificationStatus,
      checkedAt: run.completed_at ?? run.started_at ?? run.created_at ?? null,
      cacheHit: Boolean(run.cache_hit),
      confidence: run.confidence == null ? null : Number(run.confidence),
      normalizedResult: run.normalized_result && typeof run.normalized_result === 'object'
        ? run.normalized_result as Record<string, unknown>
        : null,
    }
  }

  return summaries
}
