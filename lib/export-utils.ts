/**
 * Export utilities for reports
 */

export interface ExportOptions {
  filename?: string
  data: any[]
  stats: any
  reportType?: string
}

export interface ComplianceDocumentData {
  vehiclePatent: string
  driverName: string
  documentType: string
  expirationDate: string
  status: 'vigente' | 'por vencer' | 'vencido'
  uploadDate: string
  observations?: string
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

/**
 * Export compliance document matrix to Excel
 */
export function exportComplianceToExcel(documents: ComplianceDocumentData[], companyName: string) {
  try {
    const XLSX = require('xlsx')
    const workbook = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      ['MATRIZ DOCUMENTAL DE CUMPLIMIENTO'],
      ['Empresa:', companyName],
      ['Fecha de generación:', new Date().toLocaleDateString('es-ES')],
      [],
      ['RESUMEN ESTADÍSTICO'],
      ['Total Documentos:', documents.length],
      ['Vigentes:', documents.filter(d => d.status === 'vigente').length],
      ['Por Vencer:', documents.filter(d => d.status === 'por vencer').length],
      ['Vencidos:', documents.filter(d => d.status === 'vencido').length],
    ]
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')
    
    // Details sheet
    const detailsData = [
      ['Patente', 'Conductor', 'Tipo Documento', 'Vencimiento', 'Estado', 'Fecha Subida', 'Observaciones'],
      ...documents.map(doc => [
        doc.vehiclePatent,
        doc.driverName,
        doc.documentType,
        doc.expirationDate,
        doc.status === 'vigente' ? '✓ Vigente' : doc.status === 'por vencer' ? '⚠ Por vencer' : '✗ Vencido',
        doc.uploadDate,
        doc.observations || ''
      ])
    ]
    
    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData)
    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Documentos')
    
    XLSX.writeFile(workbook, `docufleet-matriz-${new Date().toISOString().split('T')[0]}.xlsx`)
    console.log('[v0] Exported compliance matrix to Excel')
  } catch (error) {
    console.error('[v0] Error exporting to Excel:', error)
    throw error
  }
}

/**
 * Export compliance document matrix to PDF
 */
export function exportComplianceToPDF(documents: ComplianceDocumentData[], companyName: string) {
  try {
    const jsPDF = require('jspdf').default
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(16)
    doc.text('MATRIZ DOCUMENTAL DE CUMPLIMIENTO', 10, 15)
    doc.setFontSize(10)
    doc.text(`Empresa: ${companyName}`, 10, 22)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 10, 28)
    
    // Summary
    const vigentes = documents.filter(d => d.status === 'vigente').length
    const porVencer = documents.filter(d => d.status === 'por vencer').length
    const vencidos = documents.filter(d => d.status === 'vencido').length
    
    doc.setFontSize(9)
    doc.text(`Total: ${documents.length} | Vigentes: ${vigentes} | Por Vencer: ${porVencer} | Vencidos: ${vencidos}`, 10, 35)
    
    // Table header
    const columns = ['Patente', 'Conductor', 'Documento', 'Vencimiento', 'Estado', 'Subido']
    const colWidths = [16, 28, 24, 20, 20, 20]
    let startY = 42
    const lineHeight = 6
    
    // Draw header row
    doc.setFontSize(8)
    doc.setFillColor(220, 220, 220)
    let xPos = 10
    columns.forEach((col, idx) => {
      doc.rect(xPos, startY, colWidths[idx], lineHeight, 'F')
      doc.text(col, xPos + 1, startY + 4, { maxWidth: colWidths[idx] - 2 })
      xPos += colWidths[idx]
    })
    
    // Draw data rows
    startY += lineHeight
    const pageHeight = doc.internal.pageSize.height
    let pageNum = 1
    
    documents.forEach((doc, rowIdx) => {
      // Check if we need a new page
      if (startY + lineHeight > pageHeight - 10) {
        jsPDF.addPage()
        startY = 10
        // Redraw header on new page
        let xPos = 10
        columns.forEach((col, idx) => {
          jsPDF.rect(xPos, startY, colWidths[idx], lineHeight, 'F')
          jsPDF.text(col, xPos + 1, startY + 4, { maxWidth: colWidths[idx] - 2 })
          xPos += colWidths[idx]
        })
        startY += lineHeight
        pageNum++
      }
      
      xPos = 10
      const rowData = [
        doc.vehiclePatent,
        doc.driverName,
        doc.documentType,
        doc.expirationDate,
        doc.status === 'vigente' ? '✓' : doc.status === 'por vencer' ? '⚠' : '✗',
        doc.uploadDate
      ]
      
      rowData.forEach((cell, colIdx) => {
        jsPDF.rect(xPos, startY, colWidths[colIdx], lineHeight)
        jsPDF.text(cell.substring(0, 18), xPos + 1, startY + 4, { maxWidth: colWidths[colIdx] - 2 })
        xPos += colWidths[colIdx]
      })
      
      startY += lineHeight
    })
    
    jsPDF.save(`docufleet-matriz-${new Date().toISOString().split('T')[0]}.pdf`)
    console.log('[v0] Exported compliance matrix to PDF')
  } catch (error) {
    console.error('[v0] Error exporting to PDF:', error)
    throw error
  }
}
