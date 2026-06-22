'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, AlertTriangle, Calendar, Building2, Search } from 'lucide-react'
import { DriverFilters, type DriverFilters as DriverFiltersType } from './driver-filters'
import { LicenseAndCertifications } from './license-certifications'
import { QuickHelp } from '@/components/ui/help-box'

interface ConductoresListClientProps {
  conductores: any[]
  companies: Array<{ id: string; razon_social: string; rut: string }>
}

function isLicenseExpiringSoon(date: string | null): boolean {
  if (!date) return false
  const expDate = new Date(date)
  const today = new Date()
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
}

function isLicenseExpired(date: string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

// Normalizar RUTs: quita espacios, guiones y convierte a minúsculas
function normalizeRut(rut: string | null | undefined): string {
  if (!rut) return ''
  return rut.toLowerCase().trim().replace(/[\s\-\.]/g, '')
}

export function ConductoresListClient({
  conductores: initialConductores,
  companies,
}: ConductoresListClientProps) {
  const [searchInput, setSearchInput] = useState('')
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()))
  const [filters, setFilters] = useState<DriverFiltersType>({
    searchQuery: '',
    licenseStatus: 'all',
  })

  // Handle filter changes from DriverFilters component
  const handleFiltersChange = (newFilters: DriverFiltersType) => {
    setFilters(newFilters)
  }

  // Log data estructura when component mounts for debugging
  useMemo(() => {
    if (initialConductores.length > 0) {
      console.log('[v0] Sample conductor data:', {
        conductor0: initialConductores[0],
        transportista: initialConductores[0]?.transportistas,
      })
    }
  }, [])

  // Memoized filtered list
  const filteredConductores = useMemo(() => {
    const searchQuery = (searchInput || filters.searchQuery).toLowerCase().trim()

    if (!searchQuery) {
      return initialConductores
    }

    const normalizedQuery = normalizeRut(searchQuery)

    return initialConductores.filter((conductor, index) => {
      // Build search fields array - BOTH normalized and non-normalized
      const searchFields: (string | null | undefined)[] = []

      try {
        // 1. RUT del conductor
        if (conductor?.rut) {
          searchFields.push(normalizeRut(conductor.rut))
          searchFields.push(conductor.rut.toLowerCase())
        }

        // 2. Nombre completo
        const fullName = `${conductor?.nombres || ''} ${conductor?.apellido_paterno || ''} ${conductor?.apellido_materno || ''}`.toLowerCase()
        if (fullName.trim()) {
          searchFields.push(fullName)
        }

        // 3. Nombre de la empresa/proveedor
        if (conductor?.transportistas?.razon_social) {
          searchFields.push(conductor.transportistas.razon_social.toLowerCase())
        }

        // 4. RUT del proveedor - CRITICAL FIELD
        if (conductor?.transportistas?.rut) {
          searchFields.push(normalizeRut(conductor.transportistas.rut))
          searchFields.push(conductor.transportistas.rut.toLowerCase())
        }

        // 5. Licencia
        if (conductor?.clase_licencia) {
          searchFields.push(conductor.clase_licencia.toLowerCase())
        }

        // 6. Patentes de tractos
        if (conductor?.subcontractor_drivers && Array.isArray(conductor.subcontractor_drivers)) {
          conductor.subcontractor_drivers.forEach((sd: any) => {
            if (sd?.vehicle_plate) {
              searchFields.push(sd.vehicle_plate.toLowerCase())
              searchFields.push(normalizeRut(sd.vehicle_plate))
            }
          })
        }

        // Debug: log first 5 conductors when searching
        if (index < 5) {
          const matches = searchFields.some(field => 
            field && (field.includes(searchQuery) || field.includes(normalizedQuery))
          )
          console.log(`[v0] Conductor ${index} - ${conductor?.nombres}:`, {
            rut: conductor?.rut,
            providerRut: conductor?.transportistas?.rut,
            providerRutNormalized: normalizeRut(conductor?.transportistas?.rut),
            searchQuery,
            normalizedQuery,
            searchFields,
            matches,
          })
        }

        // Check if any field matches - try both original and normalized query
        return searchFields.some(field => 
          field && (field.includes(searchQuery) || field.includes(normalizedQuery))
        )
      } catch (error) {
        console.error(`[v0] Error filtering conductor ${index}:`, error)
        return false
      }
    })
  }, [searchInput, filters.searchQuery, initialConductores])

  // Get period label for display
  const periodLabels: Record<string, string> = {
    current: 'Período Actual',
    month1: 'Último Mes',
    month2: 'Hace 2 Meses',
    month3: 'Hace 3 Meses',
    month4: 'Hace 4 Meses',
  }

  return (
    <div className="space-y-6">
      {/* Search and Period Selector */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <QuickHelp text="Busca conductores por RUT, nombre, empresa o licencia. Selecciona un período para analizar datos históricos de los últimos 4 meses." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="RUT, Nombre, Proveedor, RUT Proveedor, Licencia o Patente..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2 items-end">
              <div className="relative flex-1">
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
              <div className="relative flex-1">
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
        </CardContent>
      </Card>

      <DriverFilters companies={companies} onFiltersChange={handleFiltersChange} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{initialConductores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pensionados</div>
            <div className="text-2xl font-bold text-purple-600">
              {initialConductores.filter((c) => c.es_pensionado === true).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">No Pensionados</div>
            <div className="text-2xl font-bold text-orange-600">
              {initialConductores.filter((c) => c.es_pensionado === false).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Activos</div>
            <div className="text-2xl font-bold text-green-600">
              {initialConductores.filter((c) => c.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Búsqueda</div>
            <div className="text-2xl font-bold">{filteredConductores.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conductores List */}
      {filteredConductores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay conductores que coincidan</h3>
            <p className="text-muted-foreground text-center mb-4">
              Intenta cambiar los filtros o buscar otro término
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredConductores.map((c: any) => {
            const expired = isLicenseExpired(c.vencimiento_licencia)
            const expiringSoon = isLicenseExpiringSoon(c.vencimiento_licencia)

            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {c.nombres} {c.apellido_paterno} {c.apellido_materno}
                        </h3>
                        <p className="text-sm font-mono text-muted-foreground">
                          RUT: {c.rut}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {c.transportistas?.razon_social || "Sin asignar"}
                          </span>
                          {c.clase_licencia && (
                            <span className="text-sm text-muted-foreground font-semibold">
                              Licencia: {c.clase_licencia}
                            </span>
                          )}
                          {c.vencimiento_licencia && (
                            <span className={`flex items-center gap-1 text-sm ${
                              expired ? "text-red-600" : 
                              expiringSoon ? "text-yellow-600" : 
                              "text-muted-foreground"
                            }`}>
                              <Calendar className="h-4 w-4" />
                              Vence: {new Date(c.vencimiento_licencia).toLocaleDateString("es-CL")}
                              {expired && <AlertTriangle className="h-4 w-4 ml-1" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                          Licencia Vencida
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-semibold">
                          Por Vencer
                        </span>
                      )}
                      {!expired && !expiringSoon && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-semibold">
                          Licencia Activa
                        </span>
                      )}
                      {c.es_pensionado !== undefined && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.es_pensionado
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {c.es_pensionado ? "Pensionado" : "No Pensionado"}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.is_active 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {c.is_active ? "En Servicio" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* License and Certifications Info */}
                  <div className="pt-4 border-t">
                    <LicenseAndCertifications 
                      licenses={c.vencimiento_licencia ? [{
                        id: c.id,
                        licenseType: c.clase_licencia || 'A5',
                        expiryDate: c.vencimiento_licencia,
                        status: expired ? 'expired' : (expiringSoon ? 'pending_renewal' : 'active'),
                      }] : []}
                      certifications={[]}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Link href={`/admin/conductores/${c.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link href={`/admin/conductores/${c.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
