// Report generation utilities for DocuFleet

export interface ReportData {
  reportId: string
  organizationId: string
  reportType: string
  title: string
  generatedAt: string
  dateRange: {
    start: string
    end: string
  }
  data: {
    overallCompliance: number
    totalDocuments: number
    conformDocuments: number
    expiringDocuments: number
    missingDocuments: number
    drivers?: {
      total: number
      compliant: number
      nonCompliant: number
      score: number
    }
    vehicles?: {
      total: number
      compliant: number
      nonCompliant: number
      score: number
    }
    criticalIssues?: Array<{
      type: string
      entity: string
      severity: 'critical' | 'high' | 'medium' | 'low'
      description: string
      dueDate?: string
    }>
  }
}

/**
 * Generates PDF report content as HTML string
 */
export function generateReportHTML(report: ReportData): string {
  const { data, generatedAt, dateRange, title } = report

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; background: white; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        .header {
          border-bottom: 3px solid #ff6b35;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1a1a1a;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header .meta {
          color: #666;
          font-size: 12px;
          display: flex;
          gap: 20px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #ff6b35;
        }
        .summary-card .label {
          color: #666;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .summary-card .value {
          font-size: 32px;
          font-weight: bold;
          color: #1a1a1a;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 18px;
          color: #1a1a1a;
          margin-bottom: 15px;
          border-bottom: 2px solid #ff6b35;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        table th {
          background: #1a1a1a;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 12px;
        }
        table td {
          padding: 10px 12px;
          border-bottom: 1px solid #eee;
          font-size: 12px;
        }
        table tr:hover {
          background: #f9f9f9;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }
        .status-ok { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        .status-critical { background: #f8d7da; color: #721c24; }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 40px;
          color: #666;
          font-size: 11px;
          text-align: center;
        }
        .chart-placeholder {
          background: #f0f0f0;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .container { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>📋 ${title}</h1>
          <div class="meta">
            <span>Generado: ${new Date(generatedAt).toLocaleDateString('es-CL')}</span>
            <span>Período: ${new Date(dateRange.start).toLocaleDateString('es-CL')} - ${new Date(dateRange.end).toLocaleDateString('es-CL')}</span>
            <span>ID Reporte: ${report.reportId}</span>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary">
          <div class="summary-card">
            <div class="label">Score General</div>
            <div class="value">${data.overallCompliance}%</div>
          </div>
          <div class="summary-card">
            <div class="label">Documentos Conformes</div>
            <div class="value">${data.conformDocuments}/${data.totalDocuments}</div>
          </div>
          <div class="summary-card">
            <div class="label">Próximos a Vencer</div>
            <div class="value">${data.expiringDocuments}</div>
          </div>
          <div class="summary-card">
            <div class="label">Faltantes</div>
            <div class="value">${data.missingDocuments}</div>
          </div>
        </div>

        <!-- Drivers Section -->
        ${data.drivers ? `
          <div class="section">
            <h2>Conductores</h2>
            <table>
              <tr>
                <th>Métrica</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
              <tr>
                <td>Total de Conductores</td>
                <td>${data.drivers.total}</td>
                <td>100%</td>
              </tr>
              <tr>
                <td>Documentación Completa</td>
                <td>${data.drivers.compliant}</td>
                <td>${Math.round((data.drivers.compliant / data.drivers.total) * 100)}%</td>
              </tr>
              <tr>
                <td>Documentación Incompleta</td>
                <td>${data.drivers.nonCompliant}</td>
                <td>${Math.round((data.drivers.nonCompliant / data.drivers.total) * 100)}%</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Score de Cumplimiento</td>
                <td colspan="2" style="font-weight: bold;">
                  <span class="status-badge ${data.drivers.score >= 90 ? 'status-ok' : data.drivers.score >= 70 ? 'status-warning' : 'status-critical'}">
                    ${data.drivers.score}%
                  </span>
                </td>
              </tr>
            </table>
          </div>
        ` : ''}

        <!-- Vehicles Section -->
        ${data.vehicles ? `
          <div class="section">
            <h2>Vehículos</h2>
            <table>
              <tr>
                <th>Métrica</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
              <tr>
                <td>Total de Vehículos</td>
                <td>${data.vehicles.total}</td>
                <td>100%</td>
              </tr>
              <tr>
                <td>Documentación Completa</td>
                <td>${data.vehicles.compliant}</td>
                <td>${Math.round((data.vehicles.compliant / data.vehicles.total) * 100)}%</td>
              </tr>
              <tr>
                <td>Documentación Incompleta</td>
                <td>${data.vehicles.nonCompliant}</td>
                <td>${Math.round((data.vehicles.nonCompliant / data.vehicles.total) * 100)}%</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Score de Cumplimiento</td>
                <td colspan="2" style="font-weight: bold;">
                  <span class="status-badge ${data.vehicles.score >= 90 ? 'status-ok' : data.vehicles.score >= 70 ? 'status-warning' : 'status-critical'}">
                    ${data.vehicles.score}%
                  </span>
                </td>
              </tr>
            </table>
          </div>
        ` : ''}

        <!-- Critical Issues Section -->
        ${data.criticalIssues && data.criticalIssues.length > 0 ? `
          <div class="section">
            <h2>Problemas Críticos que Requieren Acción</h2>
            <table>
              <tr>
                <th>Tipo</th>
                <th>Entidad</th>
                <th>Severidad</th>
                <th>Descripción</th>
                <th>Fecha Límite</th>
              </tr>
              ${data.criticalIssues.map(issue => `
                <tr>
                  <td>${issue.type}</td>
                  <td>${issue.entity}</td>
                  <td><span class="status-badge status-${issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'warning' : 'ok'}">${issue.severity.toUpperCase()}</span></td>
                  <td>${issue.description}</td>
                  <td>${issue.dueDate ? new Date(issue.dueDate).toLocaleDateString('es-CL') : 'N/A'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>Este reporte fue generado automáticamente por DocuFleet by Segur-ia</p>
          <p>Para consultas o apoyo, contacte a soporte@seguriact.cl</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generates JSON report for API/Dashboard consumption
 */
export function generateReportJSON(report: ReportData): Record<string, any> {
  return {
    reportId: report.reportId,
    title: report.title,
    type: report.reportType,
    generatedAt: report.generatedAt,
    dateRange: report.dateRange,
    metrics: {
      overall_compliance: report.data.overallCompliance,
      total_documents: report.data.totalDocuments,
      conform_documents: report.data.conformDocuments,
      expiring_documents: report.data.expiringDocuments,
      missing_documents: report.data.missingDocuments,
    },
    drivers: report.data.drivers,
    vehicles: report.data.vehicles,
    critical_issues: report.data.criticalIssues,
    recommendations: generateRecommendations(report.data),
  }
}

/**
 * Generates actionable recommendations based on report data
 */
function generateRecommendations(data: any): string[] {
  const recommendations = []

  if (data.overallCompliance < 70) {
    recommendations.push('Score de cumplimiento bajo: Priorizar carga urgente de documentos faltantes')
  }

  if (data.expiringDocuments > data.totalDocuments * 0.1) {
    recommendations.push('Alto porcentaje de documentos próximos a vencer: Implementar renovación urgente')
  }

  if (data.missingDocuments > 0) {
    recommendations.push('Documentos faltantes detectados: Contactar a conductores y supervisores para acelerar carga')
  }

  if (data.drivers && data.drivers.score < 80) {
    recommendations.push('Compliance de conductores bajo: Revisar requerimientos incumplidos por conductor')
  }

  if (data.vehicles && data.vehicles.score < 80) {
    recommendations.push('Compliance de vehículos bajo: Revisar documentación por flota')
  }

  return recommendations.length > 0 ? recommendations : ['Mantener el monitoreo continuo de cumplimiento']
}
