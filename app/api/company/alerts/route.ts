import { NextResponse } from 'next/server'
import { generateAlerts } from '@/lib/operations/alert-engine'

export async function GET() {
  try {
    // Simulamos alertas generadas en tiempo real
    // En Fase 6 verdadera, estos valores vendrían de la base de datos
    const alerts = generateAlerts({
      blockedCount: 24,
      riskCount: 12,
      complianceScore: 92,
      expiringToday: 2,
      expiringThisWeek: 12
    })

    // Ordenar por severidad: critical, warning, info
    const sorted = alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })

    return NextResponse.json({
      alerts: sorted,
      stats: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length,
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching alerts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: errorMessage },
      { status: 500 }
    )
  }
}
