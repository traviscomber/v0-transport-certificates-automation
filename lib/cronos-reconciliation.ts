export type ReconciliationClaim = {
  source: string
  id: string
  state: string
  claimedAt: string | null
  staleAfterMinutes: number
}

export type ReconciliationIssue = ReconciliationClaim & {
  ageMinutes: number | null
  reason: string
}

export type ReconciliationSummary = {
  activeCount: number
  staleCount: number
  healthyCount: number
  issues: ReconciliationIssue[]
}

export const RECONCILIATION_THRESHOLDS_MINUTES: Record<string, number> = {
  system_job_runs: 30,
  prt_import_batches: 30,
  compliance_events: 10,
  documents: 30,
  document_text_extractions: 15,
  ocr_processing_batches: 30,
}

export function claimAgeMinutes(claimedAt: string | null, now = new Date()): number | null {
  if (!claimedAt) return null
  const timestamp = new Date(claimedAt)
  if (Number.isNaN(timestamp.getTime())) return null
  return Math.max(0, Math.floor((now.getTime() - timestamp.getTime()) / 60000))
}

export function reconcileClaims(claims: ReconciliationClaim[], now = new Date()): ReconciliationSummary {
  const issues: ReconciliationIssue[] = []

  for (const claim of claims) {
    const ageMinutes = claimAgeMinutes(claim.claimedAt, now)
    if (ageMinutes === null || ageMinutes <= claim.staleAfterMinutes) continue

    issues.push({
      ...claim,
      ageMinutes,
      reason: `${claim.source} lleva ${ageMinutes} min en ${claim.state}; umbral ${claim.staleAfterMinutes} min.`,
    })
  }

  return {
    activeCount: claims.length,
    staleCount: issues.length,
    healthyCount: Math.max(0, claims.length - issues.length),
    issues,
  }
}
