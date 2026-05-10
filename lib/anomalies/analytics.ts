import { AnomalyWithDetails, AnomalySeverity } from './types'

export interface AnomalyAnalytics {
  totalAnomalies: number
  bySeverity: Record<AnomalySeverity, number>
  byType: Record<string, number>
  byStatus: Record<string, number>
  detectionRate: number
  averageConfidence: number
  topDrivers: Array<{ name: string; count: number }>
  topCompanies: Array<{ name: string; count: number }>
  trend: Array<{ date: string; count: number }>
}

export function generateAnomalyAnalytics(anomalies: AnomalyWithDetails[]): AnomalyAnalytics {
  const analytics: AnomalyAnalytics = {
    totalAnomalies: anomalies.length,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    byType: {},
    byStatus: { pending: 0, approved: 0, rejected: 0, investigated: 0 },
    detectionRate: 0,
    averageConfidence: 0,
    topDrivers: [],
    topCompanies: [],
    trend: [],
  }

  const driverCounts: Record<string, number> = {}
  const companyCounts: Record<string, number> = {}
  const dateCount: Record<string, number> = {}

  anomalies.forEach(a => {
    // Severity
    if (a.severity in analytics.bySeverity) {
      analytics.bySeverity[a.severity as AnomalySeverity]++
    }

    // Type
    analytics.byType[a.anomaly_type] = (analytics.byType[a.anomaly_type] || 0) + 1

    // Status
    const status = a.action_taken || 'pending'
    if (status in analytics.byStatus) {
      analytics.byStatus[status as keyof typeof analytics.byStatus]++
    }

    // Driver
    if (a.driver_name) {
      driverCounts[a.driver_name] = (driverCounts[a.driver_name] || 0) + 1
    }

    // Company
    if (a.company_name) {
      companyCounts[a.company_name] = (companyCounts[a.company_name] || 0) + 1
    }

    // Trend
    const date = new Date(a.detected_at).toISOString().split('T')[0]
    dateCount[date] = (dateCount[date] || 0) + 1
  })

  // Top drivers
  analytics.topDrivers = Object.entries(driverCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Top companies
  analytics.topCompanies = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Trend
  analytics.trend = Object.entries(dateCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30) // Last 30 days

  // Detection rate (approved / total)
  analytics.detectionRate = analytics.totalAnomalies > 0 
    ? (analytics.bySeverity.critical + analytics.bySeverity.high) / analytics.totalAnomalies 
    : 0

  // Average confidence (estimated based on severity distribution)
  const highSeverityCount = analytics.bySeverity.critical + analytics.bySeverity.high
  analytics.averageConfidence = highSeverityCount / Math.max(analytics.totalAnomalies, 1)

  return analytics
}
