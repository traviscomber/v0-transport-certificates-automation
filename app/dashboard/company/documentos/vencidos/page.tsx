'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CalendarDays, ShieldAlert } from 'lucide-react'
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
