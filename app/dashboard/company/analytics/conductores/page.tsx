'use client'

import { useEffect, useState } from 'react'
import { Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComplianceSummary } from '@/components/analytics/compliance-summary'
import { ComplianceScorecard } from '@/components/analytics/compliance-scorecard'
import { ConductorComplianceMetrics, ConductorComplianceReport } from '@/lib/conductor-analytics'

export default function ConductorAnalyticsPage() {
  const [report, setReport] = useState<ConductorComplianceReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterRisk, setFilterRisk] = useState<'all' | 'green' | 'yellow' | 'red'>('all')

  useEffect(() => {
    fetchComplianceReport()
  }, [])

  const fetchComplianceReport = async () => {
    try {
      console.log('[v0] Fetching compliance report...')
      const response = await fetch('/api/company/analytics/conductor-compliance')
      if (!response.ok) throw new Error('Failed to fetch report')
      const data = await response.json()
      console.log('[v0] Report fetched with', data.conductors.length, 'conductors')
      setReport(data)
    } catch (error) {
      console.error('[v0] Error fetching report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredConductors = () => {
    if (!report) return []
    if (filterRisk === 'all') return report.conductors
    return report.conductors.filter(c => c.riskLevel === filterRisk)
  }

  const exportToCSV = () => {
    if (!report) return
    
    const headers = ['Conductor', 'RUT', 'Cumplimiento %', 'Riesgo', 'Aprobados', 'Rechazados', 'Pendientes', 'Por Vencer', 'Confianza IA']
    const rows = report.conductors.map(c => [
      c.conductorName,
      c.rut,
      c.complianceScore,
      c.riskLevel,
      c.approvedDocuments,
      c.rejectedDocuments,
      c.pendingDocuments,
      c.expiringDocuments,
      (c.averageAiConfidence * 100).toFixed(0),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando datos de cumplimiento...</p>
      </div>
    )
  }

  const filteredConductors = getFilteredConductors()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Cumplimiento</h1>
          <p className="text-gray-600 mt-1">Análisis de conformidad documentaria por conductor</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {report && (
        <ComplianceSummary
          totalConductors={report.summary.totalConductors}
          averageComplianceScore={report.summary.averageComplianceScore}
          highRiskCount={report.summary.highRiskCount}
          mediumRiskCount={report.summary.mediumRiskCount}
          lowRiskCount={report.summary.lowRiskCount}
        />
      )}

      {/* Filter Section */}
      <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#929191' }}>
        <Filter className="w-5 h-5" style={{ color: '#434547' }} />
        <span className="text-sm font-medium" style={{ color: '#434547' }}>Filtrar por riesgo:</span>
        <div className="flex gap-2">
          {[
            { value: 'all' as const, label: 'Todos', color: 'bg-gray-100 hover:bg-gray-200' },
            { value: 'green' as const, label: 'Bajo', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
            { value: 'yellow' as const, label: 'Medio', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
            { value: 'red' as const, label: 'Alto', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilterRisk(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterRisk === option.value ? option.color : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.label}
              {option.value !== 'all' && ` (${
                option.value === 'green'
                  ? (report?.summary.lowRiskCount ?? 0)
                  : option.value === 'yellow'
                    ? (report?.summary.mediumRiskCount ?? 0)
                    : (report?.summary.highRiskCount ?? 0)
              })`}
            </button>
          ))}
        </div>
      </div>

      {/* Conductors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConductors.length > 0 ? (
          filteredConductors.map(conductor => (
            <ComplianceScorecard key={conductor.conductorId} conductor={conductor} />
          ))
        ) : (
          <div className="lg:col-span-2 text-center py-12">
            <p className="text-gray-500">No hay conductores con este nivel de riesgo</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {report && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredConductors.length} de {report.summary.totalConductors} conductores
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Última actualización: {new Date().toLocaleString('es-CL')}
          </p>
        </div>
      )}
    </div>
  )
}
