'use client'

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  timestamp: Date
  action?: {
    label: string
    href: string
  }
  dismissible?: boolean
}

export interface AnomalyDetectionResult {
  alerts: Alert[]
  metrics: {
    criticalCount: number
    warningCount: number
    trendingUp: boolean
  }
}

/**
 * Detects anomalies in document data
 */
export function detectDocumentAnomalies(
  documents: any[],
  conductors: any[] = []
): AnomalyDetectionResult {
  const alerts: Alert[] = []
  const now = new Date()

  // Check for overdue documents
  const overdueCount = documents.filter((d) => {
    const expiryDate = new Date(d.expiry_date)
    return expiryDate < now && d.status !== 'renovated'
  }).length

  if (overdueCount > 5) {
    alerts.push({
      id: 'overdue-docs-critical',
      severity: 'critical',
      title: 'Documentos Vencidos',
      description: `${overdueCount} documentos han excedido su fecha de vencimiento. Acción inmediata requerida.`,
      timestamp: now,
      action: { label: 'Ver Vencidos', href: '/dashboard/company/documentos/vencidos' },
    })
  } else if (overdueCount > 0) {
    alerts.push({
      id: 'overdue-docs-warning',
      severity: 'warning',
      title: 'Documentos por Vencer',
      description: `${overdueCount} documentos están próximos a vencer en los próximos 7 días.`,
      timestamp: now,
      action: { label: 'Ver Renovar', href: '/dashboard/company/documentos/renovar' },
    })
  }

  // Check for pending documents
  const pendingCount = documents.filter((d) => d.status === 'pending').length
  if (pendingCount > 10) {
    alerts.push({
      id: 'pending-docs-warning',
      severity: 'warning',
      title: 'Documentos Pendientes de Aprobación',
      description: `${pendingCount} documentos están en estado pendiente. Requieren revisión.`,
      timestamp: now,
      action: { label: 'Ver Pendientes', href: '/dashboard/company/documentos/pendientes' },
    })
  }

  // Check for rejected documents
  const rejectedCount = documents.filter((d) => d.status === 'rejected').length
  if (rejectedCount > 0) {
    alerts.push({
      id: 'rejected-docs-warning',
      severity: 'warning',
      title: 'Documentos Rechazados',
      description: `${rejectedCount} documentos fueron rechazados y requieren corrección.`,
      timestamp: now,
      action: { label: 'Ver Rechazados', href: '/dashboard/company/documentos/rechazados' },
    })
  }

  // Check for conductors with incomplete profiles
  const incompleteProfiles = conductors.filter((c) => !c.license_expiry || !c.training_date).length
  if (incompleteProfiles > 0) {
    alerts.push({
      id: 'incomplete-profiles',
      severity: 'warning',
      title: 'Perfiles de Conductores Incompletos',
      description: `${incompleteProfiles} conductores tienen información faltante en sus perfiles.`,
      timestamp: now,
      action: { label: 'Ver Conductores', href: '/dashboard/company/conductores' },
    })
  }

  // Success alert if everything is good
  if (alerts.length === 0) {
    alerts.push({
      id: 'system-healthy',
      severity: 'success',
      title: 'Sistema en Perfecto Estado',
      description: 'Todos los documentos y perfiles están actualizados y cumplientes.',
      timestamp: now,
    })
  }

  return {
    alerts,
    metrics: {
      criticalCount: alerts.filter((a) => a.severity === 'critical').length,
      warningCount: alerts.filter((a) => a.severity === 'warning').length,
      trendingUp: overdueCount > 5 || pendingCount > 10,
    },
  }
}

/**
 * Calculates statistical anomalies using standard deviation
 */
export function detectStatisticalAnomalies(
  dataPoints: number[],
  threshold: number = 2 // 2 standard deviations
): { anomalies: number[]; mean: number; stdDev: number } {
  if (dataPoints.length < 2) {
    return { anomalies: [], mean: 0, stdDev: 0 }
  }

  const mean = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length
  const variance = dataPoints.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / dataPoints.length
  const stdDev = Math.sqrt(variance)

  const anomalies = dataPoints.filter((x) => Math.abs(x - mean) > threshold * stdDev)

  return { anomalies, mean, stdDev }
}

/**
 * Generates severity-based recommendations
 */
export function getAlertRecommendations(alert: Alert): string[] {
  const recommendations: Record<string, string[]> = {
    'overdue-docs-critical': [
      'Contactar inmediatamente a responsables de documentos',
      'Solicitar renovación urgente',
      'Revisar políticas de retención',
    ],
    'overdue-docs-warning': [
      'Enviar recordatorios de renovación',
      'Agendar siguientes actualizaciones',
      'Revisar calendario de vencimientos',
    ],
    'pending-docs-warning': [
      'Asignar revisores disponibles',
      'Establecer SLAs de aprobación',
      'Comunicar estado a interesados',
    ],
    'rejected-docs-warning': [
      'Notificar de rechazos y razones',
      'Proporcionar guía de corrección',
      'Reenviar para nueva revisión',
    ],
  }

  return recommendations[alert.id] || ['Monitorear situación', 'Escalar si es necesario']
}
