/**
 * Expiration Analysis Engine
 * Analyzes and categorizes upcoming expirations
 */

export interface ExpirationInfo {
  id: string
  entity: string
  document: string
  expiryDate: string
  daysRemaining: number
  priority: 'urgent' | 'soon' | 'upcoming'
  category: '0-3' | '3-7' | '7-15' | '15-30'
}

/**
 * Categorize days until expiry
 */
export function getPriority(daysRemaining: number): 'urgent' | 'soon' | 'upcoming' {
  if (daysRemaining <= 3) return 'urgent'
  if (daysRemaining <= 7) return 'soon'
  return 'upcoming'
}

export function getCategory(daysRemaining: number): '0-3' | '3-7' | '7-15' | '15-30' {
  if (daysRemaining <= 3) return '0-3'
  if (daysRemaining <= 7) return '3-7'
  if (daysRemaining <= 15) return '7-15'
  return '15-30'
}

/**
 * Calculate days between two dates
 */
export function calculateDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const expiryDate = new Date(expiryDateStr)
  expiryDate.setHours(0, 0, 0, 0)
  
  const timeDiff = expiryDate.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  return daysDiff
}

/**
 * Analyze expirations and return prioritized list
 */
export function analyzeExpirations(
  expirations: Array<{ id: string; entity: string; document: string; expiryDate: string }>
): ExpirationInfo[] {
  const analyzed = expirations
    .map(exp => ({
      ...exp,
      daysRemaining: calculateDaysUntilExpiry(exp.expiryDate),
      priority: getPriority(calculateDaysUntilExpiry(exp.expiryDate)),
      category: getCategory(calculateDaysUntilExpiry(exp.expiryDate))
    }))
    .filter(exp => exp.daysRemaining <= 30) // Only show items expiring within 30 days
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  return analyzed
}

/**
 * Group expirations by category
 */
export function groupExpirationsByCategory(
  expirations: ExpirationInfo[]
): Record<'0-3' | '3-7' | '7-15' | '15-30', ExpirationInfo[]> {
  return {
    '0-3': expirations.filter(e => e.category === '0-3'),
    '3-7': expirations.filter(e => e.category === '3-7'),
    '7-15': expirations.filter(e => e.category === '7-15'),
    '15-30': expirations.filter(e => e.category === '15-30'),
  }
}

/**
 * Calculate compliance score (0-100)
 */
export function calculateComplianceScore(
  total: number,
  operativos: number,
  riesgo: number,
  bloqueados: number
): number {
  if (total === 0) return 100
  
  const operativosScore = (operativos / total) * 100
  const riesgoScore = (riesgo / total) * 20
  const bloqueadosScore = (bloqueados / total) * (-50)
  
  const score = operativosScore + riesgoScore + bloqueadosScore
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Get compliance trends
 */
export interface ComplianceTrend {
  date: string
  score: number
  operativos: number
  riesgo: number
  bloqueados: number
}

export function getTrendMessage(score: number): { level: 'excellent' | 'good' | 'warning' | 'critical'; message: string } {
  if (score >= 95) return { level: 'excellent', message: 'Cumplimiento excelente' }
  if (score >= 85) return { level: 'good', message: 'Cumplimiento bueno' }
  if (score >= 70) return { level: 'warning', message: 'Cumplimiento requiere atención' }
  return { level: 'critical', message: 'Cumplimiento crítico' }
}
