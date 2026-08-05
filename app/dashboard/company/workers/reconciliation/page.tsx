'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Building2, CheckCircle2, CircleDashed, Loader2, Search, ShieldAlert, Users } from 'lucide-react'

type CompanyOption = {
  id: string
  rut?: string
  nombre?: string
  razon_social?: string
  nombre_fantasia?: string
}

type WorkerRow = {
  company_entity_ref: string
  period_start: string
  worker_rut: string
  worker_name: string | null
  has_liquidation: boolean
  has_previred: boolean
  reconciliation_status: string
  verification_state: 'verified' | 'review_required' | 'partial_evidence' | 'insufficient_data'
  reconciliation_confidence: number | null
  last_observed_at: string | null
}

type WorkerResponse = {
  companyRef: string
  period: string | null
  summary: {
    total: number
    verified: number
    reviewRequired: number
    partialEvidence: number
    insufficientData: number
  }
  workers: WorkerRow[]
  generatedAt: string
}

const stateLabels: Record<WorkerRow['verification_state'], string> = {
  verified: 'Verificado',
  review_required: 'Revisión requerida',
  partial_evidence: 'Evidencia parcial',
  insufficient_data: 'Información insuficiente',
}

export default function WorkerReconciliationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyRef = searchParams.get('companyRef')?.trim() || ''
  const period = searchParams.get('period')?.trim() || ''
  const state = searchParams.get('state')?.trim() || ''

  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [data, setData] = useState<WorkerResponse | null>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingWorkers, setLoadingWorkers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCompanies() {
      try {
        const response = await fetch('/api/dashboard/data', { cache: 'no-store', credentials: 'same-origin' })
        if (!response.ok) throw new Error(`Dashboard API ${response.status}`)
        const payload = await response.json()
        const rows = Array.isArray(payload.dashboard?.transportistas) ? payload.dashboard.transportistas : []
        if (!cancelled) setCompanies(rows)
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'No fue posible cargar empresas')
      } finally {
        if (!cancelled) setLoadingCompanies(false)
      }
    }

    loadCompanies()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!companyRef) {
      setData(null)
      return
    }

    const controller = new AbortController()

    async function loadWorkers() {
      setLoadingWorkers(true)
      setError(null)
      const params = new URLSearchParams({ companyRef })
      if (period) params.set('period', period)
      if (state) params.set('state', state)

      try {
        const response = await fetch(`/api/internal/worker-reconciliation?${params.toString()}`, {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Worker reconciliation API ${response.status}`)
        setData(await response.json())
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No fue posible cargar trabajadores')
      } finally {
        if (!controller.signal.aborted) setLoadingWorkers(false)
      }
    }

    loadWorkers()
    return () => controller.abort()
  }, [companyRef, period, state])

  const selectedCompany = companies.find((company) => company.id === companyRef)

  const updateQuery = (next: { companyRef?: string; period?: string; state?: string }) => {
    const params = new URLSearchParams()
    const nextCompany = next.companyRef ?? companyRef
    const nextPeriod = next.period ?? period
    const nextState = next.state ?? state
    if (nextCompany) params.set('companyRef', nextCompany)
    if (nextPeriod) params.set('period', nextPeriod)
    if (nextState) params.set('state', nextState)
    router.replace(`/dashboard/company/workers/reconciliation${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data?.workers ?? []
    return (data?.workers ?? []).filter((worker) =>
      (worker.worker_name || '').toLowerCase().includes(query) || worker.worker_rut.toLowerCase().includes(query),
    )
  }, [data, search])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Users className="h-4 w-4" /> Conciliación laboral
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Trabajadores por empresa y período</h1>
            <p className="mt-2 text-sm text-slate-400">Vista de revisión basada en liquidaciones y Previred. No modifica decisiones ni documentos.</p>
          </div>
          <Link href="/dashboard/company" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver a empresas
          </Link>
        </header>

        <section className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            <span className="mb-2 flex items-center gap-2"><Building2 className="h-4 w-4" /> Empresa</span>
            <select value={companyRef} onChange={(event) => updateQuery({ companyRef: event.target.value, period: '', state: '' })} disabled={loadingCompanies} className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-900 px-3 text-sm">
              <option value="">Selecciona una empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.razon_social || company.nombre || company.nombre_fantasia || 'Empresa sin nombre'}{company.rut ? ` · ${company.rut}` : ''}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Período</span>
            <input type="month" value={period ? period.slice(0, 7) : ''} onChange={(event) => updateQuery({ period: event.target.value ? `${event.target.value}-01` : '' })} className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-900 px-3 text-sm" />
          </label>

          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Estado</span>
            <select value={state} onChange={(event) => updateQuery({ state: event.target.value })} className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-900 px-3 text-sm">
              <option value="">Todos</option>
              <option value="verified">Verificado</option>
              <option value="review_required">Revisión requerida</option>
              <option value="partial_evidence">Evidencia parcial</option>
              <option value="insufficient_data">Información insuficiente</option>
            </select>
          </label>
        </section>

        {selectedCompany && <p className="mb-4 text-sm text-slate-400">Mostrando: <span className="font-medium text-slate-200">{selectedCompany.razon_social || selectedCompany.nombre || selectedCompany.nombre_fantasia}</span></p>}

        {data && (
          <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-500">Total</p><p className="mt-1 text-2xl font-semibold">{data.summary.total}</p></div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4"><p className="text-xs text-emerald-300">Verificados</p><p className="mt-1 text-2xl font-semibold">{data.summary.verified}</p></div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4"><p className="text-xs text-amber-300">Evidencia parcial</p><p className="mt-1 text-2xl font-semibold">{data.summary.partialEvidence}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs text-slate-500">Revisión / insuficiente</p><p className="mt-1 text-2xl font-semibold">{data.summary.reviewRequired + data.summary.insufficientData}</p></div>
          </section>
        )}

        {companyRef && (
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar trabajador por nombre o RUT" className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-900 pl-10 pr-3 text-sm" />
          </div>
        )}

        {loadingWorkers && <div className="flex items-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Cargando conciliación</div>}
        {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4 text-sm text-rose-200">{error}</div>}

        {!companyRef && !error && <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6 text-sm text-slate-400">Selecciona una empresa para revisar sus trabajadores.</div>}

        {data && !loadingWorkers && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-white/[0.035] text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3">Trabajador</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Liquidación</th><th className="px-4 py-3">Previred</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Confianza</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredWorkers.map((worker) => (
                    <tr key={`${worker.worker_rut}-${worker.period_start}`} className="bg-slate-950/50">
                      <td className="px-4 py-3"><p className="font-medium text-slate-100">{worker.worker_name || 'Nombre no disponible'}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{worker.worker_rut}</p></td>
                      <td className="px-4 py-3 text-slate-300">{worker.period_start}</td>
                      <td className="px-4 py-3">{worker.has_liquidation ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleDashed className="h-4 w-4 text-slate-600" />}</td>
                      <td className="px-4 py-3">{worker.has_previred ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleDashed className="h-4 w-4 text-slate-600" />}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${worker.verification_state === 'verified' ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200' : worker.verification_state === 'review_required' ? 'border-amber-400/25 bg-amber-400/[0.07] text-amber-200' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}>{worker.verification_state === 'review_required' && <ShieldAlert className="h-3.5 w-3.5" />}{stateLabels[worker.verification_state]}</span></td>
                      <td className="px-4 py-3 font-mono text-slate-400">{worker.reconciliation_confidence !== null ? `${Math.round(Number(worker.reconciliation_confidence) * 100)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredWorkers.length === 0 && <div className="p-6 text-sm text-slate-400">No hay trabajadores para los filtros seleccionados.</div>}
          </div>
        )}
      </div>
    </main>
  )
}
