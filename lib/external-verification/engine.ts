import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVerificationAdapter } from './registry'
import { isVerificationProviderFailure, isVerificationSuccess } from './circuit-status'
import type { VerificationRequest, VerificationResult } from './types'

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}

export function createInputFingerprint(request: VerificationRequest): string {
  const canonical = stableSerialize({
    sourceCode: request.sourceCode,
    entityType: request.entityType,
    entityId: request.entityId ?? null,
    documentSource: request.documentSource ?? null,
    documentId: request.documentId ?? null,
    payload: request.payload,
  })

  return createHash('sha256').update(canonical).digest('hex')
}

function isFeatureEnabled() {
  return process.env.EXTERNAL_VERIFICATION_LAB_ENABLED === 'true'
}

export async function runExternalVerification(
  request: VerificationRequest,
  requestedBy?: string,
): Promise<{ runId: string; result: VerificationResult; cacheHit: boolean }> {
  if (!isFeatureEnabled()) {
    throw new Error('External verification laboratory is disabled')
  }

  const supabase = createAdminClient()
  const fingerprint = createInputFingerprint(request)
  const now = new Date()

  const { data: source, error: sourceError } = await supabase
    .from('external_verification_sources')
    .select('code, is_enabled, cache_ttl_seconds, failure_threshold, cooldown_seconds')
    .eq('code', request.sourceCode)
    .single()

  if (sourceError || !source) throw new Error('Verification source is not configured')
  if (!source.is_enabled) throw new Error('Verification source is disabled')

  const { data: circuit } = await supabase
    .from('external_verification_circuit_state')
    .select('state, retry_after, consecutive_failures')
    .eq('source_code', request.sourceCode)
    .single()

  if (circuit?.state === 'open' && circuit.retry_after && new Date(circuit.retry_after) > now) {
    throw new Error('Verification source circuit is open')
  }

  const { data: cached } = await supabase
    .from('external_verification_cache')
    .select('normalized_result, evidence, status, expires_at')
    .eq('source_code', request.sourceCode)
    .eq('input_fingerprint', fingerprint)
    .gt('expires_at', now.toISOString())
    .maybeSingle()

  const { data: run, error: runError } = await supabase
    .from('external_verification_runs')
    .insert({
      source_code: request.sourceCode,
      entity_type: request.entityType,
      entity_id: request.entityId ?? null,
      document_source: request.documentSource ?? null,
      document_id: request.documentId ?? null,
      input_fingerprint: fingerprint,
      input_payload: request.payload,
      status: cached ? cached.status : 'running',
      cache_hit: Boolean(cached),
      requested_by: requestedBy ?? null,
      started_at: now.toISOString(),
      completed_at: cached ? now.toISOString() : null,
      normalized_result: cached?.normalized_result ?? null,
      evidence: cached?.evidence ?? [],
      expires_at: cached?.expires_at ?? null,
    })
    .select('id')
    .single()

  if (runError || !run) throw new Error('Could not create verification run')

  if (cached) {
    return {
      runId: run.id,
      cacheHit: true,
      result: {
        status: cached.status,
        normalizedResult: cached.normalized_result,
        evidence: cached.evidence,
      } as VerificationResult,
    }
  }

  const startedAt = Date.now()
  const adapter = getVerificationAdapter(request.sourceCode)

  try {
    const result = await adapter.verify(request)
    const completedAt = new Date()
    const durationMs = Date.now() - startedAt
    const expiresAt = new Date(completedAt.getTime() + source.cache_ttl_seconds * 1000)
    const successful = isVerificationSuccess(result.status)
    const providerFailure = isVerificationProviderFailure(result.status)
    const nextFailures = providerFailure ? (circuit?.consecutive_failures ?? 0) + 1 : 0
    const shouldOpen = providerFailure && nextFailures >= source.failure_threshold
    const retryAfter = shouldOpen
      ? new Date(completedAt.getTime() + source.cooldown_seconds * 1000).toISOString()
      : null

    await supabase
      .from('external_verification_runs')
      .update({
        status: result.status,
        normalized_result: result.normalizedResult ?? null,
        evidence: result.evidence ?? [],
        confidence: result.confidence ?? null,
        error_code: result.errorCode ?? null,
        error_message: result.errorMessage ?? null,
        http_status: result.httpStatus ?? null,
        duration_ms: durationMs,
        completed_at: completedAt.toISOString(),
        expires_at: successful ? expiresAt.toISOString() : null,
      })
      .eq('id', run.id)

    if (successful) {
      await supabase.from('external_verification_cache').upsert({
        source_code: request.sourceCode,
        input_fingerprint: fingerprint,
        normalized_result: result.normalizedResult ?? {},
        evidence: result.evidence ?? [],
        status: result.status,
        fetched_at: completedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
    }

    await supabase
      .from('external_verification_circuit_state')
      .update({
        state: shouldOpen ? 'open' : 'closed',
        consecutive_failures: nextFailures,
        opened_at: shouldOpen ? completedAt.toISOString() : null,
        retry_after: retryAfter,
        last_error_code: providerFailure ? result.errorCode ?? result.status.toUpperCase() : null,
        updated_at: completedAt.toISOString(),
      })
      .eq('source_code', request.sourceCode)

    return { runId: run.id, result, cacheHit: false }
  } catch (error) {
    const completedAt = new Date()
    const nextFailures = (circuit?.consecutive_failures ?? 0) + 1
    const shouldOpen = nextFailures >= source.failure_threshold
    const retryAfter = shouldOpen
      ? new Date(completedAt.getTime() + source.cooldown_seconds * 1000).toISOString()
      : null
    const message = error instanceof Error ? error.message : 'Unknown verification error'

    await Promise.all([
      supabase
        .from('external_verification_runs')
        .update({ status: 'failed', error_code: 'ADAPTER_FAILURE', error_message: message, duration_ms: Date.now() - startedAt, completed_at: completedAt.toISOString() })
        .eq('id', run.id),
      supabase
        .from('external_verification_circuit_state')
        .update({
          state: shouldOpen ? 'open' : 'closed',
          consecutive_failures: nextFailures,
          opened_at: shouldOpen ? completedAt.toISOString() : null,
          retry_after: retryAfter,
          last_error_code: 'ADAPTER_FAILURE',
          updated_at: completedAt.toISOString(),
        })
        .eq('source_code', request.sourceCode),
    ])

    throw error
  }
}
