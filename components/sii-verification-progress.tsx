'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type ProgressSummary = {
  total: number
  processed: number
  pending: number
  running: number
  successful: number
  warnings: number
  failed: number
  notFound: number
  blocked: number
  percentage: number
  updatedAt: string
}

export function SiiVerificationProgress() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch('/api/external-verification/sii-statuses', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
        if (!response.ok) return
        const data = await response.json()
        if (active && data.summary) setSummary(data.summary)
      } catch (error) {
        console.error('[SII progress] Failed to load progress', error)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, 30000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  if (isLoading || !summary) {
    return (
      <Card className="border-slate-700/60 bg-slate-950/70">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando avance de validación SII...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Validación tributaria SII</p>
              <h2 className="mt-1 text-xl font-bold text-white">{summary.processed} de {summary.total} procesados</h2>
              <p className="mt-1 text-sm text-slate-400">Actualización automática cada 30 segundos</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-4xl font-bold tabular-nums text-white">{summary.percentage}%</p>
              <p className="text-xs text-slate-500">{summary.pending} pendientes</p>
            </div>
          </div>

          <div className="h-4 overflow-hidden rounded-full border border-slate-700 bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.percentage}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-[width] duration-700 ease-out"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-semibold">Con respuesta</span></div>
              <p className="mt-2 text-2xl font-bold text-emerald-100">{summary.successful + summary.warnings}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 text-amber-300"><AlertTriangle className="h-4 w-4" /><span className="text-xs font-semibold">Con alertas</span></div>
              <p className="mt-2 text-2xl font-bold text-amber-100">{summary.warnings}</p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
              <div className="flex items-center gap-2 text-rose-300"><AlertTriangle className="h-4 w-4" /><span className="text-xs font-semibold">Fallidos</span></div>
              <p className="mt-2 text-2xl font-bold text-rose-100">{summary.failed + summary.notFound + summary.blocked}</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <div className="flex items-center gap-2 text-blue-300"><Clock3 className="h-4 w-4" /><span className="text-xs font-semibold">En curso</span></div>
              <p className="mt-2 text-2xl font-bold text-blue-100">{summary.running}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
