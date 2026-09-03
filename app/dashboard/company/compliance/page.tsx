'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Building2, Loader2, ShieldCheck } from 'lucide-react'
import { CompliancePassport } from '@/components/compliance-passport'

type CompanyOption = {
  id: string
  rut?: string
  nombre?: string
  razon_social?: string
  nombre_fantasia?: string
}

export default function CompanyCompliancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyRef = searchParams.get('companyRef')?.trim() || ''
  const period = searchParams.get('period')?.trim() || undefined
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [companyLoadError, setCompanyLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCompanies() {
      setLoadingCompanies(true)
      setCompanyLoadError(null)

      try {
        const response = await fetch('/api/dashboard/data', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        })

        if (!response.ok) throw new Error(`Dashboard API ${response.status}`)

        const payload = await response.json()
        const transportistas = Array.isArray(payload.dashboard?.transportistas)
          ? payload.dashboard.transportistas
          : []

        if (!cancelled) setCompanies(transportistas)
      } catch (error) {
        console.error('[compliance-passport] Error loading companies:', error)
        if (!cancelled) setCompanyLoadError('No fue posible cargar la lista de empresas.')
      } finally {
        if (!cancelled) setLoadingCompanies(false)
      }
    }

    loadCompanies()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyRef),
    [companies, companyRef],
  )

  const handleCompanyChange = (nextCompanyRef: string) => {
    if (!nextCompanyRef) {
      router.replace('/dashboard/company/compliance')
      return
    }

    const params = new URLSearchParams()
    params.set('companyRef', nextCompanyRef)
    if (period) params.set('period', period)
    router.replace(`/dashboard/company/compliance?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#F2F0EB]">
      <header className="flex flex-col gap-4 border-b border-[#303238] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">
            <ShieldCheck className="h-4 w-4" />
            Cumplimiento empresarial
          </div>
          <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">Pasaporte de cumplimiento</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A9ADB3]">
            Estado operacional respaldado por decisiones, conciliaciones y evidencia vigente.
          </p>
        </div>

        <Link
          href="/dashboard/company"
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[5px] px-3 py-2 text-sm text-[#C6C8CC] transition-colors hover:bg-[#202226] hover:text-[#F2F0EB]"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </header>

      <section className="rounded-[5px] bg-[#181A1D] p-4 sm:p-5">
        <label htmlFor="company-ref" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#D8D6D1]">
          <Building2 className="h-4 w-4 text-[#777C84]" />
          Empresa
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            id="company-ref"
            value={companyRef}
            onChange={(event) => handleCompanyChange(event.target.value)}
            disabled={loadingCompanies}
            className="min-h-11 w-full rounded-[5px] border border-[#303238] bg-[#202226] px-3 text-sm text-[#F2F0EB] outline-none transition-colors focus:border-[#742D3D] focus:ring-2 focus:ring-[#742D3D]/25 disabled:cursor-wait disabled:opacity-60 sm:max-w-xl"
          >
            <option value="">Selecciona una empresa</option>
            {companies.map((company) => {
              const primaryName = company.razon_social || company.nombre || company.nombre_fantasia || 'Empresa sin nombre'
              const secondary = company.rut ? ` · ${company.rut}` : ''
              return (
                <option key={company.id} value={company.id}>
                  {primaryName}{secondary}
                </option>
              )
            })}
          </select>

          {loadingCompanies && (
            <span className="inline-flex items-center gap-2 text-sm text-[#A9ADB3]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando empresas
            </span>
          )}
        </div>

        {companyLoadError && <p className="mt-3 text-sm text-[#D999A5]">{companyLoadError}</p>}
        {selectedCompany && (
          <p className="mt-3 text-sm text-[#A9ADB3]">
            Mostrando: <span className="font-medium text-[#D8D6D1]">{selectedCompany.razon_social || selectedCompany.nombre || selectedCompany.nombre_fantasia}</span>
          </p>
        )}
      </section>

      {!companyRef ? (
        <section className="rounded-[5px] bg-[#181A1D] p-6">
          <h2 className="text-base font-medium">Selecciona una empresa</h2>
          <p className="mt-2 text-sm leading-6 text-[#A9ADB3]">
            El pasaporte mostrará únicamente validaciones respaldadas por evidencia real. Los estados sin documentación aportada se omiten.
          </p>
        </section>
      ) : (
        <CompliancePassport
          companyRef={companyRef}
          period={period}
          compact
          collapsible
          defaultExpanded={false}
        />
      )}
    </div>
  )
}
