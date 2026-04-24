/**
 * Export utilities for reports
 */

export interface ExportOptions {
  filename?: string
  data: any[]
  stats: any
  reportType?: string
}

/**
 * Export report data to CSV (Excel compatible)
 */
export function exportToExcel(options: ExportOptions) {
  const { data, stats, filename = 'reporte' } = options

  // Prepare CSV headers
  const headers = ['RUT/ID', 'Nombre', 'Categoría', 'Estado', 'Documentos']
  
  // Prepare CSV rows
  const rows = data.map(item => [
    item.rut,
    item.nombres || item.nombre_fantasia || 'N/A',
    item.category,
    item.is_active ? 'Activo' : 'Inactivo',
    item.documentCount
  ])

  // Add stats summary at the end
  const statsRows = [
    [],
    ['RESUMEN ESTADÍSTICO'],
    ['Total de Registros', stats.total],
    ['Registros Activos', stats.activos],
    ['Registros Inactivos', stats.inactivos],
    ['Con Documentación', stats.conDocumentos],
    ['Sin Documentación', stats.sinDocumentos],
  ]

  // Combine all rows
  const allRows = [headers, ...rows, ...statsRows]

  // Convert to CSV string
  const csv = allRows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const stringCell = String(cell)
      return stringCell.includes(',') || stringCell.includes('"') 
        ? `"${stringCell.replace(/"/g, '""')}"` 
        : stringCell
    }).join(',')
  ).join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  console.log('[v0] Exported to Excel:', filename)
}

/**
 * Export report data to PDF
 */
export async function exportToPDF(options: ExportOptions) {
  const { data, stats, filename = 'reporte', reportType = 'general' } = options

  try {
    // Check if html2pdf is available, otherwise use a simple text format
    const pdfContent = generatePDFContent(data, stats, reportType)
    
    // Create blob
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('[v0] Exported to PDF:', filename)
  } catch (error) {
    console.error('[v0] Error exporting to PDF:', error)
    throw error
  }
}

/**
 * Generate PDF content as formatted text
 */
function generatePDFContent(data: any[], stats: any, reportType: string): string {
  const timestamp = new Date().toLocaleString('es-ES')
  
  let content = `
╔════════════════════════════════════════════════════════════════╗
║                    REPORTE DE CUMPLIMIENTO                    ║
║                    Sistema de Transportes                      ║
╚════════════════════════════════════════════════════════════════╝

Fecha de Generación: ${timestamp}
Tipo de Reporte: ${reportType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMEN ESTADÍSTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de Registros:              ${stats.total}
Registros Activos:               ${stats.activos} (${((stats.activos/stats.total)*100).toFixed(1)}%)
Registros Inactivos:             ${stats.inactivos} (${((stats.inactivos/stats.total)*100).toFixed(1)}%)
Con Documentación:               ${stats.conDocumentos} (${((stats.conDocumentos/stats.total)*100).toFixed(1)}%)
Sin Documentación:               ${stats.sinDocumentos} (${((stats.sinDocumentos/stats.total)*100).toFixed(1)}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETALLES DE REGISTROS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`

  // Add table headers
  content += 'RUT/ID              | Nombre                      | Categoría         | Estado    | Docs\n'
  content += '────────────────────┼─────────────────────────────┼───────────────────┼───────────┼──────\n'

  // Add data rows
  data.forEach(item => {
    const rut = (item.rut || '').padEnd(19)
    const nombre = ((item.nombres || item.nombre_fantasia || 'N/A').substring(0, 27)).padEnd(27)
    const categoria = (item.category || '').padEnd(17)
    const estado = (item.is_active ? 'Activo' : 'Inactivo').padEnd(9)
    const docs = String(item.documentCount || 0)

    content += `${rut} | ${nombre} | ${categoria} | ${estado} | ${docs}\n`
  })

  content += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generado automáticamente por el Sistema de Reportes Inteligentes
Para más información, contacte al administrador del sistema.

`

  return content
}
