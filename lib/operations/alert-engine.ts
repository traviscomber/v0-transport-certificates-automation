/**
 * Alert Generation Engine
 * Generates alerts based on operational thresholds and rules
 */

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  entity?: string
  actionUrl?: string
  timestamp: string
  resolved: boolean
}

/**
 * Generate alerts based on operational status
 */
export function generateAlerts(params: {
  blockedCount: number
  riskCount: number
  complianceScore: number
  expiringToday: number
  expiringThisWeek: number
}): Alert[] {
  const alerts: Alert[] = []
  const now = new Date().toISOString()

  // Critical: Has blocked items
  if (params.blockedCount > 0) {
    alerts.push({
      id: `alert-blocked-${params.blockedCount}`,
      title: 'Documentos vencidos',
      message: `${params.blockedCount} subcontratistas tienen documentos vencidos y están bloqueados`,
      severity: 'critical',
      timestamp: now,
      resolved: false,
      actionUrl: '/operacional/operaciones-hoy'
    })
  }

  // Warning: Many items in risk
  if (params.riskCount > 10) {
    alerts.push({
      id: `alert-risk-${params.riskCount}`,
      title: 'Muchos elementos en riesgo',
      message: `${params.riskCount} subcontratistas están próximos a vencer`,
      severity: 'warning',
      timestamp: now,
      resolved: false,
      actionUrl: '/operacional/alertas'
    })
  }

  // Warning: Items expiring this week
  if (params.expiringThisWeek > 0) {
    alerts.push({
      id: `alert-expiring-week`,
      title: 'Vencimientos en los próximos 7 días',
      message: `${params.expiringThisWeek} documentos vencen en los próximos 7 días`,
      severity: 'warning',
      timestamp: now,
      resolved: false,
      actionUrl: '/operacional/control'
    })
  }

  // Info: Items expiring today
  if (params.expiringToday > 0) {
    alerts.push({
      id: `alert-expiring-today`,
      title: 'Vencimientos hoy',
      message: `${params.expiringToday} documento${params.expiringToday > 1 ? 's' : ''} vence${params.expiringToday > 1 ? 'n' : ''} hoy`,
      severity: 'info',
      timestamp: now,
      resolved: false,
      actionUrl: '/operacional/control'
    })
  }

  // Warning: Low compliance score
  if (params.complianceScore < 80) {
    alerts.push({
      id: `alert-compliance`,
      title: 'Cumplimiento bajo',
      message: `Score de cumplimiento en ${params.complianceScore}%`,
      severity: params.complianceScore < 70 ? 'critical' : 'warning',
      timestamp: now,
      resolved: false,
      actionUrl: '/operacional/control'
    })
  }

  return alerts
}

/**
 * Filter alerts by severity
 */
export function filterAlertsBySeverity(alerts: Alert[], severity: AlertSeverity): Alert[] {
  return alerts.filter(a => a.severity === severity)
}

/**
 * Get alert count by severity
 */
export function getAlertCounts(alerts: Alert[]): Record<AlertSeverity, number> {
  return {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }
}

/**
 * Get total active alerts
 */
export function getTotalActiveAlerts(alerts: Alert[]): number {
  return alerts.filter(a => !a.resolved).length
}

/**
 * Determine if system needs immediate action
 */
export function systemNeedsImmediateAction(alerts: Alert[]): boolean {
  const critical = alerts.filter(a => a.severity === 'critical' && !a.resolved)
  return critical.length > 0
}
