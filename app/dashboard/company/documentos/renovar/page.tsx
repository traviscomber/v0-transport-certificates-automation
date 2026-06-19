'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, AlertTriangle, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RenewalDocumentsList } from '@/components/renewal-documents-list'
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

export default function RenovarPage() {
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
        console.error('[v0] Error loading renewal documents:', loadError)
        setError('No se pudieron cargar los documentos próximos a renovar.')
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

  const renewalDocuments = useMemo(() => {
    const futureDocs = documents
      .filter((doc) => {
        if (!doc.expiration_date) return false
        const expirationDate = new Date(doc.expiration_date)
        return expirationDate >= todayStart
      })
      .map((doc) => {
        const expirationDate = new Date(doc.expiration_date as string)
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...doc,
          days_until_expiration: daysUntilExpiration,
        }
      })

    return filterByMonthYear(futureDocs, (doc) => doc.expiration_date, filters.month, filters.year)
      .sort((a, b) => (a.days_until_expiration || 0) - (b.days_until_expiration || 0))
  }, [documents, filters.month, filters.year, todayStart])

  const filterLabel = getMonthLabel(filters.month, filters.year)
  const dueSoon = renewalDocuments.filter((doc) => (doc.days_until_expiration || 999) <= 30).length

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
                  <Calendar className="h-6 w-6 text-yellow-500" />
                  Próximos a Vencer
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Planificación de renovaciones por mes y año
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-2">
              {renewalDocuments.length} documentos
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
                  <Clock3 className="h-5 w-5 text-yellow-400" />
                  Renovaciones por período
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Mostrando documentos con vencimiento futuro para {filterLabel}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">A renovar pronto</p>
                <p className="text-2xl font-bold text-yellow-400">{dueSoon}</p>
              </div>
            </CardHeader>
          </Card>

          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <p className="text-slate-400">Cargando documentos por renovar...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          ) : renewalDocuments.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Calendar className="h-12 w-12 text-slate-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sin documentos por renovar</h3>
                    <p className="text-slate-400 mt-2">
                      No hay documentos futuros para el período seleccionado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-yellow-900/20 border-yellow-700/50">
                <CardContent className="pt-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 text-sm font-medium">
                      Acción preventiva: solicita renovación antes del vencimiento
                    </p>
                    <p className="text-yellow-200/70 text-xs mt-1">
                      Los documentos del período filtrado están listos para planificación temprana.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <RenewalDocumentsList initialDocuments={renewalDocuments as any} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
