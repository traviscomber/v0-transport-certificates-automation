import { AnomalyWithDetails, AnomalyListResponse, AnomalySeverity } from './types'

export function getSeverityColor(severity: AnomalySeverity): string {
  const colors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  }
  return colors[severity]
}

export function getSeverityBadgeColor(severity: AnomalySeverity): string {
  const colors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  }
  return colors[severity]
}

export function getAnomalyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fraud: 'Fraude Detectado',
    alteration: 'Documento Alterado',
    expiration: 'Documento Vencido',
    invalid_format: 'Formato Inválido',
    missing_data: 'Datos Faltantes',
    document_damage: 'Documento Dañado',
  }
  return labels[type] || type
}
