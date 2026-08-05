'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileSearch, ShieldCheck, Users, Truck } from 'lucide-react'

type WorkerPeriod = {
  company_entity_ref: string
  period_start: string
  worker_periods: number
  verified_workers: number
  review_required_workers: number
  partial_evidence_workers: number
  average_confidence: number | null
}

type OcrItem = {
  document_id: string
  file_name: string | null
  inferred_document_type: string
  impact_priority: number
  processing_action: string
}

type ResponseData = {
  workerPeriods: WorkerPeriod[]
  ocr: { summary: Record<string, number>; items: OcrItem[] }
  vehicles: Array<{ company_ref: string; supplied_documents: number }>
  generatedAt: string
}

export default function ComplianceOperationsPage() {
  const [data, setData] = useState<ResponseData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/internal/compliance-operations', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`API ${response.status}`)
        return response.json()
      })
      .then(setData)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar los datos'))
  }, [])

  const latestWorkerRows = data?.workerPeriods.slice(0, 12) ?? []
  const priorityOcr = data?.ocr.items.slice(0, 20) ?? []

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Revisión interna
            </div>
            <h1 className="mt-3 text-2xl font-semibold">Operaciones de cumplimiento</h1>
            <p className="mt-2 text-sm text-slate-400">Vista protegida para validar evidencia, conciliación, OCR y documentos vehiculares antes de mostrarlos en el flujo habitual.</p>
          </div>
          <Link href="/dashboard/company/compliance" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
            <ArrowLeft className="h-4 w-4" /> Volver al Passport
          </Link>
        </header>

        {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4 text-sm text-rose-200">{error}</div>}
        {!data && !error && <div className="rounded-xl border border-white/10 p-6 text-sm text-slate-400">Cargando datos operacionales…</div>}

        {data && (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <Users className="h-4 w-4 text-slate-400" />
                <p className="mt-3 text-2xl font-semibold">{data.workerPeriods.length}</p>
                <p className="text-xs text-slate-500">resúmenes empresa–período</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <FileSearch className="h-4 w-4 text-slate-400" />
                <p className="mt-3 text-2xl font-semibold">{data.ocr.items.length}</p>
                <p className="text-xs text-slate-500">documentos OCR priorizados visibles</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <Truck className="h-4 w-4 text-slate-400" />
                <p className="mt-3 text-2xl font-semibold">{data.vehicles.length}</p>
                <p className="text-xs text-slate-500">empresas con documentos vehiculares</p>
              </article>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <h2 className="text-sm font-semibold">Conciliación laboral reciente</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="text-slate-500"><tr><th className="pb-3">Empresa</th><th>Período</th><th>Verificados</th><th>Parciales</th><th>Revisión</th><th>Confianza</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {latestWorkerRows.map((row) => (
                      <tr key={`${row.company_entity_ref}-${row.period_start}`}>
                        <td className="py-3 font-mono text-slate-300">{row.company_entity_ref}</td>
                        <td>{row.period_start}</td><td>{row.verified_workers}</td><td>{row.partial_evidence_workers}</td><td>{row.review_required_workers}</td><td>{row.average_confidence ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <h2 className="text-sm font-semibold">OCR priorizado por impacto</h2>
              <p className="mt-1 text-xs text-slate-500">Previred e imposiciones tienen prioridad máxima; liquidaciones y contratos siguen a continuación.</p>
              <div className="mt-4 space-y-2">
                {priorityOcr.map((item) => (
                  <div key={item.document_id} className="flex flex-col gap-1 rounded-lg border border-white/7 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="truncate text-sm text-slate-200">{item.file_name || 'Documento sin nombre'}</p><p className="text-xs text-slate-500">{item.inferred_document_type} · {item.processing_action}</p></div>
                    <span className="text-xs font-mono text-slate-400">Prioridad {item.impact_priority}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
