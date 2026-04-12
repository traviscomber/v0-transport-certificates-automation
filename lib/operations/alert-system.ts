/**
 * DocuFleet Alert System
 * Generates alerts and notifications based on operational status changes
 */

export type AlertLevel = 'critical' | 'warning' | 'info'
export type AlertType = 
  | 'DOCUMENT_EXPIRED'
  | 'DOCUMENT_MISSING'
  | 'DOCUMENT_EXPIRING_SOON'
  | 'ENTITY_BLOCKED'
  | 'ENTITY_AT_RISK'
  | 'COMPLIANCE_SCORE_LOW'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VALIDATION_PENDING'
  | 'DOCUMENT_VALIDATED'
  | 'DOCUMENT_REJECTED'

export interface Alert {
  id: string
  type: AlertType
  level: AlertLevel
  title: string
  message: string
  entityId: string
  entityType: 'driver' | 'subcontractor' | 'vehicle'
  entityName: string
  createdAt: Date
  dueDate?: Date
  isResolved: boolean
  actionRequired?: string
}

/**
 * Generate alert from operational status result
 */
export function generateAlerts(
  entityId: string,
  entityName: string,
  entityType: 'driver' | 'subcontractor' | 'vehicle',
  blockedReasons: string[],
  riskReasons: string[],
  score: number
): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()

  // Critical alerts - Entity is BLOCKED
  for (const reason of blockedReasons) {
    if (reason.includes('vencido')) {
      alerts.push({
        id: `${entityId}-expired-${Date.now()}`,
        type: 'DOCUMENT_EXPIRED',
        level: 'critical',
        title: 'Documento Vencido',
        message: `${entityName}: ${reason}. ACCIÓN INMEDIATA REQUERIDA`,
        entityId,
        entityType,
        entityName,
        createdAt: now,
        isResolved: false,
        actionRequired: 'Subir documento actualizado inmediatamente'
      })
    } else if (reason.includes('faltante')) {
      alerts.push({
        id: `${entityId}-missing-${Date.now()}`,
        type: 'DOCUMENT_MISSING',
        level: 'critical',
        title: 'Documento Faltante',
        message: `${entityName}: ${reason}. ACCIÓN INMEDIATA REQUERIDA`,
        entityId,
        entityType,
        entityName,
        createdAt: now,
        isResolved: false,
        actionRequired: 'Subir documento requerido'
      })
    } else if (reason.includes('inactiva')) {
      alerts.push({
        id: `${entityId}-blocked-${Date.now()}`,
        type: 'ENTITY_BLOCKED',
        level: 'critical',
        title: 'Entidad Bloqueada',
        message: `${entityName} está bloqueada y NO PUEDE OPERAR`,
        entityId,
        entityType,
        entityName,
        createdAt: now,
        isResolved: false,
        actionRequired: 'Contactar administración'
      })
    }
  }

  // Warning alerts - Entity is at RISK
  for (const reason of riskReasons) {
    if (reason.includes('vence en')) {
      const daysMatch = reason.match(/(\d+)\s*días/)
      const days = daysMatch ? parseInt(daysMatch[1]) : null
      const dueDate = new Date(now)
      if (days) {
        dueDate.setDate(dueDate.getDate() + days)
      }

      alerts.push({
        id: `${entityId}-expiring-${Date.now()}`,
        type: 'DOCUMENT_EXPIRING_SOON',
        level: 'warning',
        title: 'Documento Próximo a Vencer',
        message: `${entityName}: ${reason}`,
        entityId,
        entityType,
        entityName,
        createdAt: now,
        dueDate,
        isResolved: false,
        actionRequired: days && days <= 7 ? 'Renovar documento urgentemente' : 'Programar renovación'
      })
    }
  }

  // Low compliance score
  if (score < 60) {
    alerts.push({
      id: `${entityId}-low-compliance-${Date.now()}`,
      type: 'COMPLIANCE_SCORE_LOW',
      level: 'warning',
      title: 'Bajo Cumplimiento',
      message: `${entityName} tiene un índice de cumplimiento bajo (${score}%)`,
      entityId,
      entityType,
      entityName,
      createdAt: now,
      isResolved: false,
      actionRequired: 'Revisar documentación y resolver incidencias'
    })
  }

  return alerts
}

/**
 * Generate all alerts from status batch results
 */
export function generateAlertsBatch(
  entities: Array<{
    id: string
    nombre: string
    type: 'driver' | 'subcontractor' | 'vehicle'
    blockedReasons: string[]
    riskReasons: string[]
    score: number
  }>
): Alert[] {
  const allAlerts: Alert[] = []
  for (const entity of entities) {
    const alerts = generateAlerts(
      entity.id,
      entity.nombre,
      entity.type,
      entity.blockedReasons,
      entity.riskReasons,
      entity.score
    )
    allAlerts.push(...alerts)
  }
  return allAlerts
}

/**
 * Get critical alerts (entity cannot operate)
 */
export function getCriticalAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter(a => a.level === 'critical')
}

/**
 * Get warning alerts (entity at risk)
 */
export function getWarningAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter(a => a.level === 'warning')
}

/**
 * Get alerts by entity
 */
export function getAlertsByEntity(alerts: Alert[], entityId: string): Alert[] {
  return alerts.filter(a => a.entityId === entityId)
}

/**
 * Sort alerts by urgency
 * Critical first, then by due date (nearest first)
 */
export function sortAlertsByUrgency(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    // Critical before warning
    if (a.level !== b.level) {
      return a.level === 'critical' ? -1 : 1
    }

    // By due date if both have one
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }

    // By creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

/**
 * Format alert for display
 */
export function formatAlert(alert: Alert): {
  icon: string
  color: string
  badge: string
} {
  const config = {
    'critical': {
      icon: '🔴',
      color: 'red',
      badge: 'CRÍTICO'
    },
    'warning': {
      icon: '🟡',
      color: 'yellow',
      badge: 'ADVERTENCIA'
    },
    'info': {
      icon: '🔵',
      color: 'blue',
      badge: 'INFORMACIÓN'
    }
  }

  return config[alert.level]
}
