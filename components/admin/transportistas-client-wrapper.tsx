'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, MoreHorizontal, CheckCircle2, Search, Calendar } from 'lucide-react'
import { QuickHelp } from '@/components/ui/help-box'

interface TransportistasClientWrapperProps {
  transportistas: any[]
}

// Normalizar RUTs: quita espacios, guiones y convierte a minúsculas
function normalizeRut(rut: string | null | undefined): string {
  if (!rut) return ''
  return rut.toLowerCase().trim().replace(/[\s\-\.]/g, '')
}

export function TransportistasClientWrapper({
  transportistas: initialTransportistas,
}: TransportistasClientWrapperProps) {
  const [searchInput, setSearchInput] = useState('')
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()))
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string | null>(null)

  // Get unique ejecutivas for filter dropdown
  const ejecutivas = useMemo(() => {
    const uniqueEjecutivas = new Set<string>()
    initialTransportistas.forEach((t) => {
      if (t.ejecutivo) {
        uniqueEjecutivas.add(t.ejecutivo)
      }
    })
    return Array.from(uniqueEjecutivas).sort()
  }, [initialTransportistas])

  // Calculate period dates for filtering
  const getPeriodDates = (period: string) => {
    const now = new Date()
    const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

    switch (period) {
      case 'current':
        return { start: startOfMonth(now), end: new Date() }
      case 'month1':
        const prevMonth1 = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return { start: startOfMonth(prevMonth1), end: endOfMonth(prevMonth1) }
      case 'month2':
        const prevMonth2 = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        return { start: startOfMonth(prevMonth2), end: endOfMonth(prevMonth2) }
      case 'month3':
        const prevMonth3 = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        return { start: startOfMonth(prevMonth3), end: endOfMonth(prevMonth3) }
      case 'month4':
        const prevMonth4 = new Date(now.getFullYear(), now.getMonth() - 4, 1)
        return { start: startOfMonth(prevMonth4), end: endOfMonth(prevMonth4) }
      default:
        return { start: startOfMonth(now), end: new Date() }
    }
  }

  // Memoized filtered list
  const filteredTransportistas = useMemo(() => {
    const query = searchInput.toLowerCase().trim()
    const normalizedQuery = normalizeRut(query)

    return initialTransportistas.filter((t) => {
      // 1. FILTER BY EJECUTIVA
      if (selectedEjecutiva && t.ejecutivo !== selectedEjecutiva) {
        return false
      }

      // 2. SEARCH FILTER
      if (query) {
        const searchFields = [
          normalizeRut(t.rut),
          t.rut?.toLowerCase(),
          t.razon_social?.toLowerCase(),
          t.nombre_fantasia?.toLowerCase(),
          t.representante_legal?.toLowerCase(),
          t.correo?.toLowerCase(),
          t.ejecutivo?.toLowerCase(),
        ]

        const matches = searchFields.some(
          (field) => field && (field.includes(query) || field.includes(normalizedQuery))
        )

        if (!matches) return false
      }

      return true
    })
  }, [searchInput, selectedEjecutiva, initialTransportistas])

  // Get month name for display
  const getMonthName = (month: string) => {
    const monthNames: Record<string, string> = {
      '01': 'Enero',
      '02': 'Febrero',
      '03': 'Marzo',
      '04': 'Abril',
      '05': 'Mayo',
      '06': 'Junio',
      '07': 'Julio',
      '08': 'Agosto',
      '09': 'Septiembre',
      '10': 'Octubre',
      '11': 'Noviembre',
      '12': 'Diciembre',
    }
    return monthNames[month] || ''
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <QuickHelp text="Busca transportistas por RUT, empresa o ejecutiva asignada. Selecciona período para datos históricos de los últimos 4 meses." />
          
          {/* Search and Period Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por RUT, razón social, representante, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mes</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Año</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ejecutiva Filter */}
          {ejecutivas.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Filtrar por Ejecutiva Asignada
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedEjecutiva ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEjecutiva(null)}
                >
                  Todas
                </Button>
                {ejecutivas.map((ejecutiva) => {
                  const count = initialTransportistas.filter(t => t.ejecutivo === ejecutiva).length
                  return (
                    <Button
                      key={ejecutiva}
                      variant={selectedEjecutiva === ejecutiva ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedEjecutiva(ejecutiva)}
                    >
                      {ejecutiva}
                      <span className="ml-1 text-xs opacity-70">({count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transportistas List */}
      {filteredTransportistas.length === 0 && searchInput ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Intenta con otro término de búsqueda (RUT, nombre, correo)
            </p>
          </CardContent>
        </Card>
      ) : filteredTransportistas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay transportistas registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza registrando tu primera empresa de transporte
            </p>
            <Link href="/admin/transportistas/nuevo">
              <Button>Registrar Transportista</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Transportistas</CardTitle>
                <CardDescription>
                  {filteredTransportistas.length} de {initialTransportistas.length} transportistas · {getMonthName(selectedMonth)} {selectedYear}
                </CardDescription>
              </div>
              <div className="text-xs text-muted-foreground">
                {filteredTransportistas.reduce((acc, t) => acc + (t.is_active ? 1 : 0), 0)} activos
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">RUT</th>
                    <th className="text-left py-3 px-4 font-semibold">Razón Social</th>
                    <th className="text-left py-3 px-4 font-semibold">Representante Legal</th>
                    <th className="text-left py-3 px-4 font-semibold">Ejecutivo</th>
                    <th className="text-left py-3 px-4 font-semibold">Teléfono</th>
                    <th className="text-left py-3 px-4 font-semibold">Correo</th>
                    <th className="text-left py-3 px-4 font-semibold">Comuna</th>
                    <th className="text-center py-3 px-4 font-semibold">Certificaciones</th>
                    <th className="text-center py-3 px-4 font-semibold">Estado</th>
                    <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransportistas.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{t.rut}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{t.razon_social}</p>
                          {t.nombre_fantasia && (
                            <p className="text-xs text-muted-foreground">{t.nombre_fantasia}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{t.representante_legal || '-'}</td>
                      <td className="py-3 px-4 text-sm">{t.ejecutivo_nombre || '-'}</td>
                      <td className="py-3 px-4 text-sm">{t.telefono || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {t.correo ? (
                          <a href={`mailto:${t.correo}`} className="text-blue-600 hover:underline">
                            {t.correo}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{t.comuna || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          {t.ariztia && <span title="Ariztia" className="text-green-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.lts && <span title="LTS" className="text-blue-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.rendic && <span title="Rendic" className="text-purple-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.interpolar && <span title="Interpolar" className="text-orange-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {!t.ariztia && !t.lts && !t.rendic && !t.interpolar && (
                            <span className="text-muted-foreground text-xs">Ninguna</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {t.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/admin/transportistas/${t.id}`}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
