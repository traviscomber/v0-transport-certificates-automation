'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, BarChart3, Zap, BookOpen, Loader2 } from 'lucide-react'

interface AIAnalysisPanelProps {
  analysis: Record<string, string>
  onAnalysisRequest: (type: string) => Promise<void>
  loading: boolean
  hasData: boolean
}

export function AIAnalysisPanel({ analysis, onAnalysisRequest, loading, hasData }: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('summary')

  const analysisTypes = [
    {
      id: 'summary',
      label: 'Resumen Ejecutivo',
      icon: BookOpen,
      description: 'Visión general del estado de cumplimiento'
    },
    {
      id: 'compliance',
      label: 'Cumplimiento',
      icon: BarChart3,
      description: 'Análisis detallado de cumplimiento normativo'
    },
    {
      id: 'risk',
      label: 'Riesgos',
      icon: AlertCircle,
      description: 'Identificación y evaluación de riesgos'
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: Zap,
      description: 'Alertas operacionales críticas'
    }
  ]

  return (
    <Card className="p-6 h-full">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Análisis Impulsado por IA</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Análisis automáticos generados con OpenAI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-1">
            {analysisTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.id} value={type.id} className="text-xs lg:text-sm">
                  <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="hidden lg:inline">{type.label}</span>
                  <span className="lg:hidden">{type.label.split(' ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {analysisTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="mt-4 space-y-4">
              {!analysis[type.id] ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                  <Button
                    onClick={() => onAnalysisRequest(type.id)}
                    disabled={!hasData || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      'Generar Análisis'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {analysis[type.id]}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onAnalysisRequest(type.id)}
                    disabled={loading}
                    className="w-full text-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      'Regenerar Análisis'
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>💡 Los análisis se actualizan cuando cambias los filtros o haces clic en &quot;Regenerar&quot;</p>
        </div>
      </div>
    </Card>
  )
}
