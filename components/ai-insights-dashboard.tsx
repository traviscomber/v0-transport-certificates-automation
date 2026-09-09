'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DocumentStats {
  totalDocuments: number
  analyzedDocuments: number
  averageConfidence: number
  accuracyRate: number
  documentsByType: Array<{ type: string; count: number; accuracy: number }>
  confidenceDistribution: Array<{ range: string; count: number }>
  expirationDateAccuracy: number
  trendByDate: Array<{ date: string; total: number; accurate: number }>
  recommendations?: string[]
}

export function AIInsightsDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/company/ai-training/document-analysis')
        if (!response.ok) throw new Error('No fue posible cargar la evidencia IA')

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('[v0] Stats fetch error:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar evidencia IA')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">
        Cargando evidencia IA…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[6px] border border-[#45242B] bg-[#45242B] px-6 py-5 text-sm text-[#E17B8C]">
        {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">
        Sin evidencia disponible.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--cf-text-secondary)]">Cobertura analizada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{stats.analyzedDocuments}</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">de {stats.totalDocuments} documentos observados</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <TrendingUp className="h-4 w-4 text-[var(--cf-accent-hover)]" />
              Confianza promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{Math.round(stats.averageConfidence * 100)}%</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">confianza reportada por el modelo</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--cf-text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-[#67C18D]" />
              Acuerdo observado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{Math.round(stats.accuracyRate * 100)}%</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">señal derivada del feedback disponible; no accuracy certificada</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--cf-text-secondary)]">Coincidencia de vencimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--cf-text)]">{Math.round(stats.expirationDateAccuracy * 100)}%</div>
            <p className="mt-1 text-xs text-[var(--cf-text-muted)]">comparación sólo donde existe evidencia suficiente</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] px-4 py-3 text-sm leading-6 text-[var(--cf-text-secondary)]">
        La confianza del modelo y el acuerdo observado son señales distintas. ChileFlota no interpreta confianza como exactitud y mantiene la revisión humana como fuente de decisión.
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="h-auto rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-1">
          <TabsTrigger value="distribution" className="rounded-[4px] data-[state=active]:bg-[var(--cf-accent)] data-[state=active]:text-[var(--cf-text)]">Distribución de confianza</TabsTrigger>
          <TabsTrigger value="types" className="rounded-[4px] data-[state=active]:bg-[var(--cf-accent)] data-[state=active]:text-[var(--cf-text)]">Tipos documentales</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Distribución de confianza reportada</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#36363B" />
                  <XAxis dataKey="range" stroke="#7D7D84" />
                  <YAxis stroke="#7D7D84" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#232326', border: '1px solid #36363B', borderRadius: '6px' }}
                    labelStyle={{ color: '#E7E7E9' }}
                    itemStyle={{ color: '#B1B1B6' }}
                  />
                  <Bar dataKey="count" fill="#873146" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--cf-text)]">Evidencia por tipo documental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[var(--cf-border)]">
                {stats.documentsByType.map((type) => (
                  <div key={type.type} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--cf-text)]">{type.type}</p>
                      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">{type.count} documentos observados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--cf-text)]">{Math.round(type.accuracy * 100)}%</p>
                      <p className="mt-1 text-xs text-[var(--cf-text-muted)]">acuerdo disponible</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {stats.recommendations && stats.recommendations.length > 0 && (
        <Card className="border-[#4A2F18] bg-[var(--cf-surface)] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--cf-text)]">
              <AlertCircle className="h-5 w-5 text-[#E6A35A]" />
              Observaciones para revisión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
              {stats.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#E6A35A]">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
