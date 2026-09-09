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
      <Card className="border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-[var(--cf-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--cf-text-muted)]" />
          Cargando avance de validación SII…
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-[6px] border-[var(--cf-border)] bg-[var(--cf-surface)] shadow-none">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--cf-text-muted)]">Validación tributaria SII</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--cf-text)]">{summary.processed} de {summary.total} procesados</h2>
              <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">Actualización automática cada 30 segundos</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-semibold tabular-nums tracking-[-0.04em] text-[var(--cf-text)]">{summary.percentage}%</p>
              <p className="text-xs text-[var(--cf-text-muted)]">{summary.pending} pendientes</p>
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--cf-canvas)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.percentage}>
            <div className="h-full bg-[var(--cf-accent)] transition-[width] duration-500 ease-out" style={{ width: `${summary.percentage}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatusCard icon={CheckCircle2} label="Con respuesta" value={summary.successful + summary.warnings} tone="success" />
            <StatusCard icon={AlertTriangle} label="Con alertas" value={summary.warnings} tone="warning" />
            <StatusCard icon={AlertTriangle} label="Fallidos" value={summary.failed + summary.notFound + summary.blocked} tone="danger" />
            <StatusCard icon={Clock3} label="En curso" value={summary.running} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusCard({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  const indicator = tone === 'success' ? 'text-[#67C18D]' : tone === 'warning' ? 'text-[#E6A35A]' : tone === 'danger' ? 'text-[#E17B8C]' : 'text-[var(--cf-text-muted)]'

  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface-raised)] p-3">
      <div className={`flex items-center gap-2 text-xs font-medium ${indicator}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-[var(--cf-text)]">{value}</p>
    </div>
  )
}
