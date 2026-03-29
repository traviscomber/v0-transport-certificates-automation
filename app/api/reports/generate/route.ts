import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { organizationId, reportType, dateRange, filters } = await request.json()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Report templates based on type
    const reportTemplates = {
      compliance_summary: {
        title: 'Reporte de Cumplimiento Documental',
        sections: ['overview', 'by_driver', 'by_vehicle', 'expiring', 'missing'],
        format: 'pdf',
      },
      drivers_certification: {
        title: 'Certificación de Conductores',
        sections: ['certified_drivers', 'pending_docs', 'compliance_score'],
        format: 'pdf',
      },
      vehicles_certification: {
        title: 'Certificación de Vehículos',
        sections: ['certified_vehicles', 'maintenance_status', 'compliance_score'],
        format: 'pdf',
      },
      monthly_compliance: {
        title: 'Reporte Mensual de Compliance',
        sections: ['executive_summary', 'detailed_breakdown', 'trend_analysis', 'recommendations'],
        format: 'pdf',
      },
      mandant_dashboard: {
        title: 'Dashboard para Mandante (Walmart)',
        sections: ['kpi_summary', 'fleet_overview', 'critical_issues', 'action_items'],
        format: 'json',
      },
    }

    const template = reportTemplates[reportType as keyof typeof reportTemplates] || reportTemplates.compliance_summary

    // Generate report metadata
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      organizationId,
      reportType,
      title: template.title,
      format: template.format,
      generatedAt: new Date().toISOString(),
      dateRange: dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      sections: template.sections,
      filters: filters || {},
      status: 'generating',
      downloadUrl: `/api/reports/${reportType}/download`,
      previewUrl: `/reports/preview/${reportType}`,
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      message: 'Reporte generado exitosamente',
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const organizationId = searchParams.get('organizationId')

    if (!reportType || !organizationId) {
      return NextResponse.json(
        { error: 'Report type and organization ID required' },
        { status: 400 }
      )
    }

    // Get report template info
    const templates = {
      compliance_summary: {
        name: 'Resumen de Cumplimiento',
        description: 'Visión general del cumplimiento documental de la flota',
        estimatedTime: '5 minutos',
      },
      drivers_certification: {
        name: 'Certificación de Conductores',
        description: 'Documentos validados y estado de cumplimiento por conductor',
        estimatedTime: '10 minutos',
      },
      vehicles_certification: {
        name: 'Certificación de Vehículos',
        description: 'Estado de documentación y compliance de vehículos',
        estimatedTime: '10 minutos',
      },
      monthly_compliance: {
        name: 'Reporte Mensual',
        description: 'Análisis detallado de tendencias y cumplimiento mensual',
        estimatedTime: '15 minutos',
      },
      mandant_dashboard: {
        name: 'Dashboard Mandante',
        description: 'Panel ejecutivo para Walmart con KPIs principales',
        estimatedTime: '3 minutos',
      },
    }

    const template = templates[reportType as keyof typeof templates]

    return NextResponse.json({
      success: true,
      template: template || { error: 'Unknown report type' },
    })
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
