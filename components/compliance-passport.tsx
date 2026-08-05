'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  FileCheck2,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  XCircle,
} from 'lucide-react'

export type ComplianceBadgeState = 'verified' | 'warning' | 'blocked' | 'pending' | 'unknown'

type ComplianceBadge = {
  code: string
  label: string
  state: ComplianceBadgeState
  summary?: string | null
  value?: number | string | null
  reasonCodes?: string[]
  evidence?: Record<string, unknown>
}

type PassportResponse = {
  companyRef: string
  period: string | null
  badges: ComplianceBadge[]
  generatedAt: string
}

type CompliancePassportProps = {
  companyRef: string
  period?: string
  compact?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  className?: string
}

const badgeIcons: Record<string, typeof ShieldCheck> = {
  sii_verified: ShieldCheck,
  workforce_reconciled: Building2,
  previred_complete: WalletCards,
  documentation_complete: FileCheck2,
  workers_verified: Users,
  vehicles_verified: Truck,
  operational_status: ShieldCheck,
}

const statusMeta: Record<ComplianceBadgeState, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  verified: {
    label: 'Verificado',
    classes: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200',
    icon: CheckCircle2,
  },
  warning: {
    label: 'Advertencia',
    classes: 'border-amber-400/25 bg-amber-400/[0.07] text-amber-100',
    icon: AlertTriangle,
  },
  blocked: {
    label: 'Bloqueado',
    classes: 'border-rose-400/25 bg-rose-400/[0.07] text-rose-100',
    icon: XCircle,
  },
  pending: {
    label: 'Sin documento aportado',
    classes: 'border-slate-500/35 bg-slate-500/[0.07] text-slate-300',
    icon: CircleDashed,
  },
  unknown: {
    label: 'Información insuficiente',
    classes: 'border-slate-500/35 bg-slate-500/[0.07] text-slate-300',
    icon: CircleDashed,
  },
}

function PassportSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-slate-950/55 ${compact ? 'p-4' : 'p-5'}`} aria-busy="true">
      <div className="h-4 w-44 animate-pulse rounded bg-white/8" />
      <div className={`mt-4 grid gap-2 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {Array.from({ length: compact ? 3 : 7 }).map((_, index) => (
          <div key={index} className={`${compact ? 'h-16' : 'h-24'} animate-pulse rounded-xl bg-white/[0.045]`} />
        ))}
      </div>
    </div>
  )
}

export function CompliancePassport({
  companyRef,
  period,
  compact = false,
  collapsible = false,
  defaultExpanded = false,
  className = '',
}: CompliancePassportProps) {
  const [data, setData] = useState<PassportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(!collapsible || defaultExpanded)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setError(null)
      const params = new URLSearchParams({ companyRef })
      if (period) params.set('period', period)

      try {
        const response = await fetch(`/api/internal/compliance-badges?${params.toString()}`, {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`No fue posible cargar el pasaporte (${response.status})`)
        setData(await response.json())
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : 'No fue posible cargar el pasaporte')
      }
    }

    if (companyRef) load()
    return () => controller.abort()
  }, [companyRef, period])

  const operationalBadge = useMemo(
    () => data?.badges.find((badge) => badge.code === 'operational_status'),
    [data],
  )

  if (!data && !error) return <PassportSkeleton compact={compact} />

  if (error) {
    return (
      <div className={`rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] p-4 ${className}`} role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
          <div>
            <p className="font-medium text-rose-100">Pasaporte no disponible</p>
            <p className="mt-1 text-sm text-rose-200/70">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const contentId = `compliance-passport-${companyRef}`

  return (
    <section className={`rounded-2xl border border-white/8 bg-slate-950/55 ${compact ? 'p-4' : 'p-4 sm:p-5'} ${className}`} aria-labelledby="compliance-passport-title">
      <div className={`flex gap-3 ${compact ? 'items-center' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} ${expanded ? 'border-b border-white/7 pb-4' : ''}`}>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Estado de cumplimiento</p>
          <h2 id="compliance-passport-title" className={`${compact ? 'mt-0.5 text-sm' : 'mt-1 text-lg'} font-semibold tracking-tight text-slate-100`}>
            {compact ? 'Resumen respaldado por evidencia' : 'Estado respaldado por evidencia'}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {operationalBadge && (() => {
            const meta = statusMeta[operationalBadge.state]
            const StatusIcon = meta.icon
            return (
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.classes}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {meta.label}
              </div>
            )
          })()}

          {collapsible && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={contentId}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              title={expanded ? 'Ocultar detalle' : 'Ver detalle'}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div id={contentId}>
          <div className={`mt-4 grid gap-2 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
            {data?.badges.map((badge) => {
              const meta = statusMeta[badge.state]
              const StatusIcon = meta.icon
              const BadgeIcon = badgeIcons[badge.code] ?? ShieldCheck

              return (
                <article key={badge.code} className={`rounded-xl border border-white/7 bg-white/[0.025] ${compact ? 'p-3' : 'p-3.5'} transition-colors hover:border-white/12 hover:bg-white/[0.04]`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex items-center gap-2 ${compact ? 'min-w-0' : ''}`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.055] text-slate-300">
                        <BadgeIcon className="h-4 w-4" />
                      </div>
                      {compact && <h3 className="truncate text-sm font-semibold text-slate-100">{badge.label}</h3>}
                    </div>
                    <StatusIcon className={`h-4 w-4 shrink-0 ${badge.state === 'verified' ? 'text-emerald-300' : badge.state === 'warning' ? 'text-amber-300' : badge.state === 'blocked' ? 'text-rose-300' : 'text-slate-500'}`} />
                  </div>

                  {!compact && <h3 className="mt-3 text-sm font-semibold text-slate-100">{badge.label}</h3>}

                  <p className={`${compact ? 'mt-2 line-clamp-1' : 'mt-1 line-clamp-2 min-h-10'} text-xs leading-5 text-slate-400`}>
                    {badge.summary || meta.label}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/6 pt-2 text-[11px]">
                    <span className="font-medium text-slate-300">{meta.label}</span>
                    {badge.value !== null && badge.value !== undefined && <span className="font-mono text-slate-500">{badge.value}</span>}
                  </div>
                </article>
              )
            })}
          </div>

          <p className="mt-4 text-[11px] text-slate-600">
            Actualizado {data ? new Date(data.generatedAt).toLocaleString('es-CL') : '—'}. La fuente oficial canónica prevalece sobre documentos aportados.
          </p>
        </div>
      )}
    </section>
  )
}
