// Alert utility functions for filtering, formatting, and state management
import { Alert } from './types'

/**
 * Filter alerts by ejecutiva name
 */
export function filterAlertsByEjecutiva(alerts: Alert[], ejecutivaNombre: string): Alert[] {
  return alerts.filter((alert) => alert.ejecutiva_nombre === ejecutivaNombre)
}

/**
 * Filter alerts by status
 */
export function filterAlertsByStatus(
  alerts: Alert[],
  status: 'pendiente' | 'actioned' | 'resuelto'
): Alert[] {
  return alerts.filter((alert) => alert.status === status)
}

/**
 * Filter alerts by priority
 */
export function filterAlertsByPriority(
  alerts: Alert[],
  priority: 'critical' | 'high' | 'medium' | 'low'
): Alert[] {
  return alerts.filter((alert) => alert.priority === priority)
}

/**
 * Search alerts by title or message
 */
export function searchAlerts(alerts: Alert[], query: string): Alert[] {
  const lower = query.toLowerCase()
  return alerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(lower) ||
      alert.message?.toLowerCase().includes(lower)
  )
}

/**
 * Format alert timestamp as relative time
 */
export function formatAlertTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`
  return date.toLocaleDateString('es-ES')
}

/**
 * Get alert color based on priority and status
 */
export function getAlertColor(
  priority: string,
  isDismissed: boolean,
  status?: string
): string {
  if (isDismissed) return 'border-l-4 border-l-gray-400 bg-gray-900/25 opacity-60'
  
  if (status === 'resuelto') return 'border-l-4 border-l-green-500 bg-green-900/25'
  
  switch (priority) {
    case 'critical':
      return 'border-l-4 border-l-red-500 bg-red-900/25'
    case 'high':
      return 'border-l-4 border-l-orange-500 bg-orange-900/25'
    case 'medium':
      return 'border-l-4 border-l-blue-500 bg-blue-900/25'
    case 'low':
      return 'border-l-4 border-l-slate-500 bg-slate-900/25'
    default:
      return 'border-l-4 border-l-slate-500 bg-slate-900/25'
  }
}

/**
 * Get badge color for priority
 */
export function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-600 text-white'
    case 'high':
      return 'bg-orange-600 text-white'
    case 'medium':
      return 'bg-blue-600 text-white'
    case 'low':
      return 'bg-gray-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

/**
 * Get human-readable priority label
 */
export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'CRÍTICA'
    case 'high':
      return 'ALTA'
    case 'medium':
      return 'MEDIA'
    case 'low':
      return 'BAJA'
    default:
      return priority.toUpperCase()
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'Pendiente'
    case 'actioned':
      return 'Procesada'
    case 'resuelto':
      return 'Resuelto'
    default:
      return status
  }
}

/**
 * Get action button label and color
 */
export function getActionButtonConfig(
  action: 'approve' | 'reject' | 'request_info'
): { label: string; color: string; icon: string } {
  switch (action) {
    case 'approve':
      return { label: 'Aprobar', color: 'bg-green-600 hover:bg-green-700', icon: '✓' }
    case 'reject':
      return { label: 'Rechazar', color: 'bg-red-600 hover:bg-red-700', icon: '✕' }
    case 'request_info':
      return { label: 'Solicitar Info', color: 'bg-yellow-600 hover:bg-yellow-700', icon: 'ⓘ' }
    default:
      return { label: 'Acción', color: 'bg-gray-600 hover:bg-gray-700', icon: '→' }
  }
}
