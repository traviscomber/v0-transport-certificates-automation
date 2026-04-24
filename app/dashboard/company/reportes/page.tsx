'use client'

import { useEffect, useState } from 'react'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportStats } from '@/components/reports/report-stats'
import { ReportTable } from '@/components/reports/report-table'
import { AIAnalysisPanel } from '@/components/reports/ai-analysis-panel'
import { exportToExcel, exportToPDF } from '@/lib/export-utils'
import { Download, RefreshCw } from 'lucide-react'

type ReportType = 'compliance' | 'risk' | 'summary' | 'alerts'

export default function ReportesPage() {
  const [data, setData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Record<ReportType, string>>({
    compliance: '',
    risk: '',
    summary: '',
    alerts: ''
  })
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    documentStatus: 'all',
    searchTerm: ''
  })

  const loadReportData = async (newFilters = filters) => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilters)
      })

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setStats(result.stats)
        console.log('[v0] Report data loaded:', result.stats)
      }
    } catch (error) {
      console.error('[v0] Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysis = async (reportType: ReportType) => {
    if (!stats) return

    setAnalyzing(true)
    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          stats,
          reportType
        })
      })

      const result = await response.json()
      if (result.success) {
        setAnalysis(prev => ({
          ...prev,
          [reportType]: result.analysis
        }))
        console.log('[v0] Analysis generated:', reportType)
      }
    } catch (error) {
      console.error('[v0] Error generating analysis:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    loadReportData(newFilters)
  }

  const exportToPDFClick = () => {
    if (!stats) return
    try {
      exportToPDF({
        data,
        stats,
        filename: `reporte-cumplimiento`,
        reportType: 'Cumplimiento Normativo'
      })
    } catch (error) {
      console.error('[v0] Error exporting PDF:', error)
    }
  }

  const exportToExcelClick = () => {
    if (!stats) return
    try {
      exportToExcel({
        data,
        stats,
        filename: `reporte-cumplimiento`
      })
    } catch (error) {
      console.error('[v0] Error exporting Excel:', error)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
        <p className="text-muted-foreground">
          Genera reportes de cumplimiento normativo con análisis impulsado por IA
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Sistema de Reportes Inteligentes"
        description="Utiliza filtros avanzados y análisis de IA para generar insights sobre el estado de cumplimiento normativo de conductores y subcontratistas."
        tips={[
          "Usa los filtros para segmentar por tipo, estatus y estado de documentación",
          "Genera análisis de cumplimiento, riesgos y alertas con IA",
          "Exporta datos en PDF o Excel para compartir con stakeholders",
          "Los análisis se actualizan automáticamente al cambiar los filtros"
        ]}
      />

      {/* Stats Overview */}
      {stats && <ReportStats stats={stats} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <ReportFilters 
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Resultados ({data.length})</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadReportData()}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            ) : (
              <ReportTable data={data} />
            )}
          </Card>

          {/* Export Options */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToPDFClick}
              disabled={data.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={exportToExcelClick}
              disabled={data.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="lg:col-span-1">
          <AIAnalysisPanel
            analysis={analysis}
            onAnalysisRequest={generateAnalysis}
            loading={analyzing}
            hasData={data.length > 0}
          />
        </div>
      </div>
    </div>
  )
}
