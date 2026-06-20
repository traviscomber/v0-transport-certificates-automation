'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, AlertTriangle, CalendarDays, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExpiredDocumentsList } from '@/components/expired-documents-list'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'

type DocumentRow = {
  id: string
  original_filename?: string
  document_type?: string
  file_url?: string
  expiration_date?: string
  created_at?: string
  validation_status?: string
  conductores?: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  }
}

function useUrlFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const value: DateFilterValue = {
    month: searchParams.get('month') || ALL_VALUE,
    year: searchParams.get('year') || ALL_VALUE,
  }

  const update = (next: DateFilterValue) => {
    const params = new URLSearchParams(searchParams.toString())

    if (next.month === ALL_VALUE) params.delete('month')
    else params.set('month', next.month)

    if (next.year === ALL_VALUE) params.delete('year')
    else params.set('year', next.year)

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return { value, update }
}

export default function VencidosPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { value: filters, update } = useUrlFilters()

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/company/documents/all', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setDocuments(Array.isArray(data.documents) ? data.documents : [])
      } catch (loadError) {
        console.error('[v0] Error loading expired documents:', loadError)
        setError('No se pudieron cargar los documentos vencidos.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const todayStart = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const expiredDocuments = useMemo(() => {
    const expired = documents
      .filter((doc) => {
        if (!doc.expiration_date) return false
        const expirationDate = new Date(doc.expiration_date)
        return expirationDate < todayStart
      })
      .map((doc) => {
        const expirationDate = new Date(doc.expiration_date as string)
        const daysOverdue = Math.ceil((todayStart.getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...doc,
          days_overdue: daysOverdue,
        }
      })

    return filterByMonthYear(expired, (doc) => doc.expiration_date, filters.month, filters.year)
      .sort((a, b) => (b.days_overdue || 0) - (a.days_overdue || 0))
  }, [documents, filters.month, filters.year, todayStart])

  const filterLabel = getMonthLabel(filters.month, filters.year)
  const oldestOverdue = expiredDocuments[0]

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/company/documentos">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  Documentos Vencidos
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Análisis histórico de vencimientos por mes y año
                </p>
              </div>
            </div>
            <Badge className="bg-red-600 text-white text-lg px-3 py-2">
              {expiredDocuments.length} documentos
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            <CardContent className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                  Historial de vencimientos
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Detecta lo vencido y prioriza la recuperación</h2>
                  <p className="text-sm md:text-base text-slate-300 mt-2">
                    Revisa el período seleccionado para ver qué caducó, cuánto atraso acumula y qué requiere acción inmediata.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[34rem]">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-red-300/80">Vencidos</p>
                  <p className="mt-2 text-3xl font-bold text-red-200">{expiredDocuments.length}</p>
                  <p className="mt-1 text-xs text-red-200/70">Requieren intervención</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Más crítico</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {oldestOverdue?.days_overdue ? `${oldestOverdue.days_overdue} días` : 'Sin datos'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Mayor atraso acumulado</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80">Acción</p>
                  <p className="mt-2 text-3xl font-bold text-amber-200">Revisar y escalar</p>
                  <p className="mt-1 text-xs text-amber-200/70">Prioridad inmediata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300/80">Riesgo</p>
              <p className="text-lg font-semibold text-red-200 mt-1">{expiredDocuments.length}</p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Más crítico</p>
              <p className="text-lg font-semibold text-white mt-1">
                {oldestOverdue?.days_overdue ? `${oldestOverdue.days_overdue} días` : 'Sin datos'}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">Acción</p>
              <p className="text-lg font-semibold text-amber-200 mt-1">Revisar y escalar</p>
            </div>
          </div>

          <DatePeriodFilter
            value={filters}
            onChange={update}
            onClear={() => update({ month: ALL_VALUE, year: ALL_VALUE })}
          />

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-orange-400" />
                  Historial filtrado
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Mostrando documentos vencidos para {filterLabel}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">Vencidos</p>
                <p className="text-2xl font-bold text-red-400">{expiredDocuments.length}</p>
              </div>
            </CardHeader>
          </Card>

          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <p className="text-slate-400">Cargando documentos vencidos...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          ) : expiredDocuments.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <ShieldAlert className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sin documentos vencidos</h3>
                    <p className="text-slate-400 mt-2">
                      No hay vencimientos para el período seleccionado.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Link href="/dashboard/company/documentos/renovar">
                      <Button variant="outline" size="sm" className="gap-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                        Ir a renovar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/company/reportes">
                      <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-800">
                        Ver reportes
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-red-900/30 border-red-700/50">
                <CardContent className="pt-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 text-sm font-bold">ACCIÓN CRÍTICA REQUERIDA</p>
                    <p className="text-red-200/70 text-xs mt-1">
                      {expiredDocuments.length} documento{expiredDocuments.length > 1 ? 's' : ''} vencido{expiredDocuments.length > 1 ? 's' : ''} para {filterLabel}.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <ExpiredDocumentsList initialDocuments={expiredDocuments as any} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
