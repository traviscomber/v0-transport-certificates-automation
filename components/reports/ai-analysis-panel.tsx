'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, BarChart3, AlertCircle, TrendingUp, Zap, Loader2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface AIAnalysisPanelProps {
  analysis: Record<string, string>
  onAnalysisRequest: (type: string) => void
  loading: boolean
  hasData: boolean
}

export function AIAnalysisPanel({ analysis, onAnalysisRequest, loading, hasData }: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const analysisTypes = [
    {
      id: 'summary',
      label: 'Resumen',
      icon: BarChart3,
      color: 'text-blue-400'
    },
    {
      id: 'compliance',
      label: 'Cumplimiento',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 'risk',
      label: 'Riesgos',
      icon: AlertCircle,
      color: 'text-orange-400'
    },
    {
      id: 'alerts',
      label: 'Críticos',
      icon: Zap,
      color: 'text-red-400'
    }
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-800/30 border-orange-500/20 hover:border-orange-500/40 transition-colors">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
        <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-white">Análisis IA</h3>
          <p className="text-xs text-slate-400">Insights automáticos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          {analysisTypes.map(({ id, label, icon: Icon, color }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="relative text-xs font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-orange-500/10 data-[state=active]:border-b-2 data-[state=active]:border-orange-500"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="hidden sm:inline ml-1">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {analysisTypes.map(({ id, label }) => (
          <TabsContent key={id} value={id} className="mt-4 space-y-3">
            {!analysis[id] ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Genera un análisis {label.toLowerCase()} con IA
                </p>
                <Button
                  onClick={() => onAnalysisRequest(id)}
                  disabled={loading || !hasData}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white border-0 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar Análisis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative group">
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-lg p-4 border border-slate-700/50 max-h-64 overflow-y-auto text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {analysis[id]}
                  </div>
                  <button
                    onClick={() => handleCopy(analysis[id], id)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedId === id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 hover:text-orange-400" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onAnalysisRequest(id)}
                  disabled={loading}
                  size="sm"
                  className="w-full border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/10 text-slate-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-2" />
                      Regenerar
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 text-xs text-slate-400">
        <p>✨ Los análisis se generan según los datos y filtros aplicados. Requiere datos disponibles.</p>
      </div>
    </Card>
  )
}
