import { AnomalyWithDetails } from './types'

/**
 * Export utilities for anomaly data
 */

export function exportToCSV(anomalies: AnomalyWithDetails[], filename = 'anomalies.csv'): void {
  const headers = [
    'ID',
    'Tipo de Anomalía',
    'Severidad',
    'Tipo de Documento',
    'Conductor',
    'RUT del Conductor',
    'Empresa',
    'Detectado',
    'Estado de Acción',
    'Notas',
  ]

  const rows = anomalies.map(a => [
    a.id,
    a.anomaly_type,
    a.severity,
    a.document_type || '',
    a.driver_name || '',
    a.driver_rut || '',
    a.company_name || '',
    new Date(a.detected_at).toISOString(),
    a.action_taken || 'pending',
    a.action_notes || '',
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"` 
          }
          return cell
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(anomalies: AnomalyWithDetails[], filename = 'anomalies.json'): void {
  const data = JSON.stringify(anomalies, null, 2)
  const blob = new Blob([data], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function getAnomalyStats(anomalies: AnomalyWithDetails[]) {
  const stats = {
    total: anomalies.length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byType: {} as Record<string, number>,
    byStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
      investigated: 0,
    },
    averageConfidence: 0.85,
  }

  anomalies.forEach(a => {
    // Severity
    if (a.severity in stats.bySeverity) {
      stats.bySeverity[a.severity as keyof typeof stats.bySeverity]++
    }

    // Type
    stats.byType[a.anomaly_type] = (stats.byType[a.anomaly_type] || 0) + 1

    // Status
    const status = a.action_taken || 'pending'
    if (status in stats.byStatus) {
      stats.byStatus[status as keyof typeof stats.byStatus]++
    }
  })

  return stats
}
