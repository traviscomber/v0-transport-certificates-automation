'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpBox } from '@/components/ui/help-box'
import {
  Download,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { allDriversData } from '@/lib/data/all-drivers'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { AIAnalysisPanel } from '@/components/reports/ai-analysis-panel'

export default function ReportesPage() {
  const [reportType, setReportType] = useState<'compliance' | 'risk' | 'summary' | 'alerts'>('summary')
  const [analysis, setAnalysis] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const stats = useMemo(() => {
    const drivers = allDriversData || []
    const subcontractors = allSubcontractorsData || []
    const allItems = [...drivers, ...subcontractors]

    const total = allItems.length
    const activos = allItems.filter(item => item.is_active).length
    const inactivos = total - activos
    const conDocumentos = allItems.filter(item => {
      const docs = (item as any).documentos
      return docs && Array.isArray(docs) && docs.length > 0
    }).length
    const sinDocumentos = total - conDocumentos
    const approved = allItems.filter(item => (item as any).status === 'approved').length
    const pending = allItems.filter(item => (item as any).status === 'pending').length
    const rejected = allItems.filter(item => (item as any).status === 'rejected').length

    return {
      total,
      activos,
      inactivos,
      conDocumentos,
      sinDocumentos,
      approved,
      pending,
      rejected,
    }
  }, [])

  const handleAnalysisRequest = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [...(allDriversData || []), ...(allSubcontractorsData || [])],
          stats,
          reportType: type,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate analysis')
      const result = await response.json()
      setAnalysis(prev => ({ ...prev, [type]: result.analysis }))
    } catch (error) {
      console.error('[v0] Error generating analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      id: 'summary',
      label: 'Resumen Ejecutivo',
      icon: FileText,
      description: 'Visión general del cumplimiento normativo',
      color: 'from-blue-600/20 to-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      id: 'compliance',
      label: 'Cumplimiento',
      icon: CheckCircle2,
      description: 'Análisis detallado de requisitos normativos',
      color: 'from-green-600/20 to-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      id: 'risk',
      label: 'Análisis de Riesgos',
      icon: AlertCircle,
      description: 'Identificación y evaluación de riesgos',
      color: 'from-orange-600/20 to-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      id: 'alerts',
      label: 'Alertas Críticas',
      icon: TrendingUp,
      description: 'Alertas operacionales prioritarias',
      color: 'from-red-600/20 to-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
    },
  ]

  return (
    <div className="space-y-6">
      <HelpBox
        title="Reportes y Análisis"
        description="Genera reportes profesionales impulsados por IA. Obtén insights sobre cumplimiento, riesgos y alertas críticas."
        variant="info"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">TOTAL REGISTROS</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-green-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">CUMPLIMIENTO</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {((stats.conDocumentos / stats.total) * 100).toFixed(0)}%
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">EN RIESGO</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{stats.sinDocumentos}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/50 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">TASA ACTIVOS</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {((stats.activos / stats.total) * 100).toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500/50" />
          </div>
        </Card>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map(type => {
          const Icon = type.icon
          const isActive = reportType === type.id
          return (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`p-4 rounded-lg border transition-all text-left group ${
                isActive
                  ? `${type.borderColor} bg-gradient-to-br ${type.color}`
                  : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${isActive ? type.textColor : 'text-slate-500'}`} />
                <div>
                  <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* AI Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAnalysisPanel
            analysis={analysis}
            onAnalysisRequest={handleAnalysisRequest}
            loading={loading}
            hasData={stats.total > 0}
          />
        </div>

        {/* Stats Sidebar */}
        <Card className="p-6 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-800/30 border-slate-700/50">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            Estadísticas Detalladas
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Documentos Aprobados</p>
              <p className="text-xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">En Revisión</p>
              <p className="text-xl font-bold text-blue-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Rechazados</p>
              <p className="text-xl font-bold text-red-400 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-400">Registros Inactivos</p>
              <p className="text-xl font-bold text-slate-300 mt-1">{stats.inactivos}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/10 text-slate-300"
          >
            <Download className="w-3 h-3 mr-2" />
            Descargar PDF
          </Button>
        </Card>
      </div>
    </div>
  )
}
