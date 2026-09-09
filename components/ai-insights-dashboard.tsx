'use client'

import { useEffect, useState } from 'react'
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
        const response = await fetch('/api/company/ai-training/document-analysis', { cache: 'no-store' })
        if (!response.ok) throw new Error('No fue posible cargar la evidencia IA')

        const data = await response.json()
        setStats(data)
        setError(null)
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
      <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-6 py-5 text-sm text-[var(--cf-text-secondary)]">
        <p className="font-medium text-[#E17B8C]">{error}</p>
        <p className="mt-2 text-xs text-[var(--cf-text-muted)]">No se muestran métricas de IA cuando la fuente no está disponible.</p>
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
    <div className="space-y-7">
      <section className="space-y-3" aria-labelledby="ai-summary-title">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Lectura rápida</p>
            <h2 id="ai-summary-title" className="mt-1 text-base font-semibold text-[var(--cf-text)]">Señales observadas del modelo</h2>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[var(--cf-text-muted)] sm:text-right">
            Confianza reportada y acuerdo observado se mantienen separados; ninguno sustituye la revisión humana.
          </p>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)]">
          <div className="grid grid-cols-2 xl:grid-cols-4">
            <Metric label="Cobertura analizada" value={stats.analyzedDocuments.toLocaleString('es-CL')} note={`de ${stats.totalDocuments.toLocaleString('es-CL')} observados`} />
            <Metric label="Confianza promedio" value={`${Math.round(stats.averageConfidence * 100)}%`} note="reportada por el modelo" icon={TrendingUp} divided />
            <Metric label="Acuerdo observado" value={`${Math.round(stats.accuracyRate * 100)}%`} note="según feedback disponible" icon={CheckCircle2} divided />
            <Metric label="Coincidencia vencimiento" value={`${Math.round(stats.expirationDateAccuracy * 100)}%`} note="donde existe evidencia" divided />
          </div>
        </div>
      </section>

      <div className="border-l-2 border-[var(--cf-accent)] bg-[var(--cf-surface)] px-4 py-3 text-sm leading-6 text-[var(--cf-text-secondary)]">
        ChileFlota no interpreta confianza como exactitud certificada. Las decisiones documentales siguen requiriendo la evidencia y revisión humana del flujo operacional.
      </div>

      <section className="space-y-3" aria-labelledby="ai-detail-title">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Detalle</p>
          <h2 id="ai-detail-title" className="mt-1 text-base font-semibold text-[var(--cf-text)]">Distribución y tipos documentales</h2>
        </div>

        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList className="h-auto rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-1">
            <TabsTrigger value="distribution" className="rounded-[4px] data-[state=active]:bg-[var(--cf-accent)] data-[state=active]:text-[var(--cf-text)]">Distribución de confianza</TabsTrigger>
            <TabsTrigger value="types" className="rounded-[4px] data-[state=active]:bg-[var(--cf-accent)] data-[state=active]:text-[var(--cf-text)]">Tipos documentales</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-[var(--cf-text)]">Distribución de confianza reportada</h3>
                <p className="mt-1 text-xs text-[var(--cf-text-muted)]">Cantidad de documentos por rango de confianza informado por el modelo.</p>
              </div>
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
            </div>
          </TabsContent>

          <TabsContent value="types">
            <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-5">
              <h3 className="text-base font-semibold text-[var(--cf-text)]">Evidencia por tipo documental</h3>
              <div className="mt-4 divide-y divide-[var(--cf-border)]">
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
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {stats.recommendations && stats.recommendations.length > 0 && (
        <section className="rounded-[6px] border border-[#4A2F18] bg-[var(--cf-surface)] p-5" aria-labelledby="ai-review-title">
          <h2 id="ai-review-title" className="flex items-center gap-2 text-base font-semibold text-[var(--cf-text)]">
            <AlertCircle className="h-4 w-4 text-[#E6A35A]" />
            Observaciones para revisión
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            {stats.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#E6A35A]">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Metric({ label, value, note, icon: Icon, divided }: { label: string; value: string; note: string; icon?: typeof TrendingUp; divided?: boolean }) {
  return (
    <div className={`min-w-0 p-4 ${divided ? 'border-l border-[var(--cf-border)]' : ''}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--cf-text-muted)]">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-[var(--cf-text)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--cf-text-muted)]">{note}</p>
    </div>
  )
}
