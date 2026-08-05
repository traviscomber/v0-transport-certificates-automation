'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { CompliancePassport } from '@/components/compliance-passport'

export default function CompanyCompliancePage() {
  const searchParams = useSearchParams()
  const companyRef = searchParams.get('companyRef')?.trim() || ''
  const period = searchParams.get('period')?.trim() || undefined

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Cumplimiento empresarial
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Pasaporte de cumplimiento</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Estado operacional respaldado por decisiones, conciliaciones y evidencia vigente.
            </p>
          </div>
          <Link
            href="/dashboard/company"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a empresas
          </Link>
        </div>

        {!companyRef ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-base font-semibold">Selecciona una empresa</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Abre esta vista desde una empresa o agrega el parámetro <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-slate-300">companyRef</code> a la URL.
            </p>
          </section>
        ) : (
          <CompliancePassport companyRef={companyRef} period={period} />
        )}
      </div>
    </main>
  )
}
