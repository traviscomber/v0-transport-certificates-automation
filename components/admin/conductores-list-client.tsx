'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, AlertTriangle, Calendar, Building2 } from 'lucide-react'
import { DriverFilters, type DriverFilters as DriverFiltersType } from './driver-filters'
import { LicenseAndCertifications } from './license-certifications'

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

export function ConductoresListClient({
  conductores: initialConductores,
  companies,
}: ConductoresListClientProps) {
  const [filters, setFilters] = useState<DriverFiltersType>({
    searchQuery: '',
    licenseStatus: 'all',
  })

  const handleFiltersChange = (newFilters: DriverFiltersType) => {
    console.log('[v0] Filters changed:', newFilters)
    setFilters(newFilters)
  }

  const filteredConductores = useMemo(() => {
    console.log('[v0] Applying filters:', filters)
    console.log('[v0] Initial conductores count:', initialConductores.length)

    const result = initialConductores.filter((conductor) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchesRut = conductor.rut?.toLowerCase().includes(query)
        const matchesName =
          `${conductor.nombres} ${conductor.apellido_paterno} ${conductor.apellido_materno}`
            .toLowerCase()
            .includes(query)
        const matchesProviderRut = conductor.transportistas?.rut?.toLowerCase().includes(query)

        if (!matchesRut && !matchesName && !matchesProviderRut) {
          return false
        }
      }

      if (filters.companyId && conductor.transportista_id !== filters.companyId) {
        return false
      }

      if (filters.providerRut) {
        const providerRut = filters.providerRut.toLowerCase().trim()
        const companyRut = conductor.transportistas?.rut?.toLowerCase().trim()
        if (!companyRut || !companyRut.includes(providerRut)) {
          return false
        }
      }

      if (filters.vehicleType) {
        const hasVehicleType = conductor.subcontractor_drivers?.some(
          (sd: any) => sd.vehicle_type === filters.vehicleType
        )
        if (!hasVehicleType) {
          return false
        }
      }

      if (filters.licenseStatus !== 'all') {
        const isExpired = isLicenseExpired(conductor.vencimiento_licencia)
        const isExpiringSoon = isLicenseExpiringSoon(conductor.vencimiento_licencia)

        if (filters.licenseStatus === 'expired' && !isExpired) return false
        if (filters.licenseStatus === 'expiring' && (!isExpiringSoon || isExpired))
          return false
        if (filters.licenseStatus === 'active' && (isExpired || isExpiringSoon))
          return false
      }

      return true
    })

    console.log('[v0] Filtered results count:', result.length)
    return result
  }, [filters, initialConductores])

  return (
    <div className="space-y-6">
      <DriverFilters companies={companies} onFiltersChange={handleFiltersChange} />

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total de Conductores</div>
            <div className="text-2xl font-bold">{initialConductores.length}</div>
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
            <div className="text-sm text-muted-foreground">Inactivos</div>
            <div className="text-2xl font-bold text-red-600">
              {initialConductores.filter((c) => !c.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Resultados de búsqueda</div>
            <div className="text-2xl font-bold">{filteredConductores.length}</div>
          </CardContent>
        </Card>
      </div>

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
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {c.nombres} {c.apellido_paterno} {c.apellido_materno}
                        </h3>
                        <p className="text-sm font-mono text-muted-foreground">RUT: {c.rut}</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {c.transportistas?.razon_social || 'Sin asignar'}
                          </span>
                          {c.clase_licencia && (
                            <span className="text-sm text-muted-foreground font-semibold">
                              Licencia: {c.clase_licencia}
                            </span>
                          )}
                          {c.vencimiento_licencia && (
                            <span
                              className={`flex items-center gap-1 text-sm ${
                                expired
                                  ? 'text-red-600'
                                  : expiringSoon
                                    ? 'text-yellow-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              <Calendar className="h-4 w-4" />
                              Vence: {new Date(c.vencimiento_licencia).toLocaleDateString('es-CL')}
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.is_active
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {c.is_active ? 'En Servicio' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <LicenseAndCertifications
                      licenses={
                        c.vencimiento_licencia
                          ? [
                              {
                                id: c.id,
                                licenseType: c.clase_licencia || 'A2',
                                expiryDate: c.vencimiento_licencia,
                                status: expired
                                  ? 'expired'
                                  : expiringSoon
                                    ? 'pending_renewal'
                                    : 'active',
                              },
                            ]
                          : []
                      }
                      certifications={[]}
                    />
                  </div>

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
