import { NextResponse } from 'next/server'
import { generateDetailedAlerts, analyzeOperationalData } from '@/lib/operations/data-analyzer'

export async function GET() {
  try {
    // Analizar datos reales de conductores y subcontratistas
    const operationalData = analyzeOperationalData()
    
    // Generar alertas basadas en datos reales
    const alerts = generateDetailedAlerts()

    // Ordenar por severidad: critical, warning, info
    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 }
    const sorted = alerts.sort((a, b) => {
      const aSeverity = (a.severity as string) in severityOrder ? severityOrder[a.severity] : 2
      const bSeverity = (b.severity as string) in severityOrder ? severityOrder[b.severity] : 2
      return aSeverity - bSeverity
    })

    return NextResponse.json({
      alerts: sorted,
      operationalData,
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
