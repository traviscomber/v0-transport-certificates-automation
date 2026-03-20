import { differenceInDays, parseISO, isPast } from 'date-fns'

export interface SmartAlert {
  id: string
  entityType: 'conductor' | 'licencia' | 'vehiculo' | 'f30'
  entityId: string
  entityName: string
  daysRemaining: number
  alertType: 'critical' | 'warning' | 'info'
  message: string
  expirationDate: string
  priority: number // 0 = highest
  actionUrl?: string
  dismissed?: boolean
}

export function generateSmartAlerts(
  conductores?: any[],
  vehiculos?: any[]
): SmartAlert[] {
  const alerts: SmartAlert[] = []
  const today = new Date()

  // Alerts para conductores (Licencia de conducir)
  if (conductores) {
    conductores.forEach((conductor) => {
      if (!conductor.vencimiento_licencia) return

      const expirationDate = parseISO(conductor.vencimiento_licencia)
      const daysUntilExpiry = differenceInDays(expirationDate, today)

      if (daysUntilExpiry < 0) {
        // CRITICAL: Vencido
        alerts.push({
          id: `conductor-${conductor.id}-vencido`,
          entityType: 'conductor',
          entityId: conductor.id,
          entityName: `${conductor.nombres} ${conductor.apellido_paterno}`,
          daysRemaining: daysUntilExpiry,
          alertType: 'critical',
          message: `Licencia de conducir VENCIDA hace ${Math.abs(daysUntilExpiry)} días`,
          expirationDate: conductor.vencimiento_licencia,
          priority: 0,
          actionUrl: `/admin/conductores`,
        })
      } else if (daysUntilExpiry <= 7) {
        // WARNING: 7 días
        alerts.push({
          id: `conductor-${conductor.id}-7d`,
          entityType: 'licencia',
          entityId: conductor.id,
          entityName: `${conductor.nombres} ${conductor.apellido_paterno}`,
          daysRemaining: daysUntilExpiry,
          alertType: 'critical',
          message: `Licencia vencerá en ${daysUntilExpiry} días`,
          expirationDate: conductor.vencimiento_licencia,
          priority: 1,
          actionUrl: `/admin/conductores`,
        })
      } else if (daysUntilExpiry <= 15) {
        // WARNING: 15 días
        alerts.push({
          id: `conductor-${conductor.id}-15d`,
          entityType: 'licencia',
          entityId: conductor.id,
          entityName: `${conductor.nombres} ${conductor.apellido_paterno}`,
          daysRemaining: daysUntilExpiry,
          alertType: 'warning',
          message: `Licencia vencerá en ${daysUntilExpiry} días`,
          expirationDate: conductor.vencimiento_licencia,
          priority: 2,
          actionUrl: `/admin/conductores`,
        })
      } else if (daysUntilExpiry <= 30) {
        // INFO: 30 días
        alerts.push({
          id: `conductor-${conductor.id}-30d`,
          entityType: 'licencia',
          entityId: conductor.id,
          entityName: `${conductor.nombres} ${conductor.apellido_paterno}`,
          daysRemaining: daysUntilExpiry,
          alertType: 'info',
          message: `Licencia vencerá en ${daysUntilExpiry} días - Renovación preventiva`,
          expirationDate: conductor.vencimiento_licencia,
          priority: 3,
          actionUrl: `/admin/conductores`,
        })
      }
    })
  }

  // Alerts para vehículos (Permiso de Circulación, Revisión Técnica)
  if (vehiculos) {
    vehiculos.forEach((vehiculo) => {
      // Permiso de Circulación
      if (vehiculo.vencimiento_permiso_circulacion) {
        const expirationDate = parseISO(vehiculo.vencimiento_permiso_circulacion)
        const daysUntilExpiry = differenceInDays(expirationDate, today)

        if (daysUntilExpiry < 0) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-permiso-vencido`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Permiso Circulación`,
            daysRemaining: daysUntilExpiry,
            alertType: 'critical',
            message: `Permiso de circulación VENCIDO hace ${Math.abs(daysUntilExpiry)} días`,
            expirationDate: vehiculo.vencimiento_permiso_circulacion,
            priority: 0,
            actionUrl: `/admin/vehiculos`,
          })
        } else if (daysUntilExpiry <= 7) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-permiso-7d`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Permiso Circulación`,
            daysRemaining: daysUntilExpiry,
            alertType: 'critical',
            message: `Permiso vencerá en ${daysUntilExpiry} días`,
            expirationDate: vehiculo.vencimiento_permiso_circulacion,
            priority: 1,
            actionUrl: `/admin/vehiculos`,
          })
        } else if (daysUntilExpiry <= 15) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-permiso-15d`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Permiso Circulación`,
            daysRemaining: daysUntilExpiry,
            alertType: 'warning',
            message: `Permiso vencerá en ${daysUntilExpiry} días`,
            expirationDate: vehiculo.vencimiento_permiso_circulacion,
            priority: 2,
            actionUrl: `/admin/vehiculos`,
          })
        }
      }

      // Revisión Técnica
      if (vehiculo.vencimiento_revision_tecnica) {
        const expirationDate = parseISO(vehiculo.vencimiento_revision_tecnica)
        const daysUntilExpiry = differenceInDays(expirationDate, today)

        if (daysUntilExpiry < 0) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-revision-vencido`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Revisión Técnica`,
            daysRemaining: daysUntilExpiry,
            alertType: 'critical',
            message: `Revisión técnica VENCIDA hace ${Math.abs(daysUntilExpiry)} días`,
            expirationDate: vehiculo.vencimiento_revision_tecnica,
            priority: 0,
            actionUrl: `/admin/vehiculos`,
          })
        } else if (daysUntilExpiry <= 7) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-revision-7d`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Revisión Técnica`,
            daysRemaining: daysUntilExpiry,
            alertType: 'critical',
            message: `Revisión técnica vencerá en ${daysUntilExpiry} días`,
            expirationDate: vehiculo.vencimiento_revision_tecnica,
            priority: 1,
            actionUrl: `/admin/vehiculos`,
          })
        } else if (daysUntilExpiry <= 15) {
          alerts.push({
            id: `vehiculo-${vehiculo.id}-revision-15d`,
            entityType: 'vehiculo',
            entityId: vehiculo.id,
            entityName: `${vehiculo.patente} - Revisión Técnica`,
            daysRemaining: daysUntilExpiry,
            alertType: 'warning',
            message: `Revisión técnica vencerá en ${daysUntilExpiry} días`,
            expirationDate: vehiculo.vencimiento_revision_tecnica,
            priority: 2,
            actionUrl: `/admin/vehiculos`,
          })
        }
      }
    })
  }

  // Ordenar por prioridad
  return alerts.sort((a, b) => a.priority - b.priority)
}

export function getAlertColor(alertType: string): string {
  switch (alertType) {
    case 'critical':
      return 'bg-red-50 border-red-200 text-red-900'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900'
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-900'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900'
  }
}

export function getAlertIcon(alertType: string): string {
  switch (alertType) {
    case 'critical':
      return '⚠️'
    case 'warning':
      return '⏰'
    case 'info':
      return 'ℹ️'
    default:
      return '•'
  }
}
