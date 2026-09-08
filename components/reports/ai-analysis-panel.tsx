'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, BarChart3, Check, Copy, Loader2, Sparkles, TrendingUp, Zap } from 'lucide-react'

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
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'compliance', label: 'Cumplimiento', icon: TrendingUp },
    { id: 'risk', label: 'Riesgos', icon: AlertCircle },
    { id: 'alerts', label: 'Críticos', icon: Zap },
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] p-5 shadow-none sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-[var(--cf-border)] pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[var(--cf-accent-soft)]">
          <Sparkles className="h-4 w-4 text-[var(--cf-accent-hover)]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--cf-text)]">Análisis asistido por IA</h3>
          <p className="mt-1 text-xs text-[var(--cf-text-muted)]">Apoyo a la revisión; no reemplaza la decisión humana</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] p-1">
          {analysisTypes.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="rounded-[4px] px-2 py-2 text-xs text-[var(--cf-text-secondary)] data-[state=active]:bg-[var(--cf-accent)] data-[state=active]:text-[var(--cf-text)]"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:ml-1 sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {analysisTypes.map(({ id, label }) => (
          <TabsContent key={id} value={id} className="mt-4">
            {!analysis[id] ? (
              <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-5 py-8 text-center">
                <p className="text-sm text-[var(--cf-text-secondary)]">Genera un análisis {label.toLowerCase()} con la evidencia filtrada.</p>
                <Button
                  onClick={() => onAnalysisRequest(id)}
                  disabled={loading || !hasData}
                  className="mt-4 h-9 bg-[var(--cf-accent)] text-xs text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar análisis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] p-4 pr-12 text-sm leading-6 text-[var(--cf-text-secondary)]">
                    {analysis[id]}
                  </div>
                  <button
                    onClick={() => handleCopy(analysis[id], id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-[5px] border border-[var(--cf-border)] bg-[var(--cf-surface)] text-[var(--cf-text-muted)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
                    aria-label="Copiar análisis"
                  >
                    {copiedId === id ? <Check className="h-4 w-4 text-[#67C18D]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onAnalysisRequest(id)}
                  disabled={loading}
                  size="sm"
                  className="h-9 w-full border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Regenerando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      Regenerar
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-4 border-t border-[var(--cf-border)] pt-3 text-xs leading-5 text-[var(--cf-text-muted)]">
        Los análisis se generan sobre los datos disponibles y el período seleccionado. Deben contrastarse con la evidencia documental antes de tomar una decisión.
      </p>
    </Card>
  )
}
