/**
 * DocuFleet Status Engine
 * Determines operational status (BLOCKED, RISK, OK) based on document compliance
 */

export type OperationalStatus = 'BLOCKED' | 'RISK' | 'OK'

export interface StatusResult {
  status: OperationalStatus
  blockedReasons: string[]
  riskReasons: string[]
  score: number // 0-100
}

export interface OperableEntity {
  id: string
  rut: string
  nombre: string
  type: 'driver' | 'subcontractor' | 'vehicle'
  documents?: DocumentStatus[]
  expiryDates?: Record<string, string> // documentType: expiryDate
  is_active?: boolean
}

export interface DocumentStatus {
  type: string
  status: 'valid' | 'expired' | 'missing'
  expiryDate?: string
  daysUntilExpiry?: number
}

/**
 * Calculates the operational status of an entity
 * Logic:
 * - BLOCKED: Has expired docs or missing mandatory docs
 * - RISK: Has docs expiring within 30 days
 * - OK: All docs valid and not expiring soon
 */
export function calculateStatus(entity: OperableEntity): StatusResult {
  const blockedReasons: string[] = []
  const riskReasons: string[] = []
  let score = 100

  // 1. Check if entity is inactive
  if (entity.is_active === false) {
    blockedReasons.push('Entidad inactiva')
    score = 0
  }

  // 2. Analyze documents
  if (entity.documents && entity.documents.length > 0) {
    for (const doc of entity.documents) {
      if (doc.status === 'expired') {
        blockedReasons.push(`${doc.type} vencido`)
        score -= 20
      } else if (doc.status === 'missing') {
        blockedReasons.push(`${doc.type} faltante`)
        score -= 25
      } else if (doc.daysUntilExpiry !== undefined) {
        if (doc.daysUntilExpiry <= 7) {
          riskReasons.push(`${doc.type} vence en ${doc.daysUntilExpiry} días`)
          score -= 15
        } else if (doc.daysUntilExpiry <= 30) {
          riskReasons.push(`${doc.type} vence en ${doc.daysUntilExpiry} días`)
          score -= 5
        }
      }
    }
  }

  // 3. Analyze explicit expiry dates
  if (entity.expiryDates) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const [docType, expiryDate] of Object.entries(entity.expiryDates)) {
      const expiry = new Date(expiryDate)
      expiry.setHours(0, 0, 0, 0)

      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilExpiry < 0) {
        blockedReasons.push(`${docType} vencido hace ${Math.abs(daysUntilExpiry)} días`)
        score -= 20
      } else if (daysUntilExpiry <= 7) {
        riskReasons.push(`${docType} vence en ${daysUntilExpiry} días`)
        score -= 15
      } else if (daysUntilExpiry <= 30) {
        riskReasons.push(`${docType} vence en ${daysUntilExpiry} días`)
        score -= 5
      }
    }
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine final status
  let status: OperationalStatus = 'OK'
  if (blockedReasons.length > 0) {
    status = 'BLOCKED'
  } else if (riskReasons.length > 0) {
    status = 'RISK'
  }

  return {
    status,
    blockedReasons,
    riskReasons,
    score
  }
}

/**
 * Batch calculate status for multiple entities
 */
export function calculateStatusBatch(entities: OperableEntity[]): Map<string, StatusResult> {
  const results = new Map<string, StatusResult>()
  for (const entity of entities) {
    results.set(entity.id, calculateStatus(entity))
  }
  return results
}

/**
 * Get summary statistics from a batch of status results
 */
export interface StatusSummary {
  total: number
  blocked: number
  risk: number
  ok: number
  averageScore: number
  compliancePercentage: number
}

export function summarizeStatus(results: Map<string, StatusResult>): StatusSummary {
  const statusList = Array.from(results.values())
  
  const blocked = statusList.filter(r => r.status === 'BLOCKED').length
  const risk = statusList.filter(r => r.status === 'RISK').length
  const ok = statusList.filter(r => r.status === 'OK').length
  const total = statusList.length
  const averageScore = total > 0 ? statusList.reduce((sum, r) => sum + r.score, 0) / total : 0
  const compliancePercentage = total > 0 ? Math.round((ok / total) * 100) : 0

  return {
    total,
    blocked,
    risk,
    ok,
    averageScore: Math.round(averageScore),
    compliancePercentage
  }
}

/**
 * Get entities that are NOT operable (BLOCKED) TODAY
 */
export function getBlockedEntities(results: Map<string, StatusResult>): Array<[string, StatusResult]> {
  return Array.from(results.entries()).filter(([_, result]) => result.status === 'BLOCKED')
}

/**
 * Get entities that are at RISK (expiring soon)
 */
export function getRiskEntities(results: Map<string, StatusResult>): Array<[string, StatusResult]> {
  return Array.from(results.entries()).filter(([_, result]) => result.status === 'RISK')
}
