'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, Users, Truck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  company: {
    id: string
    rut: string
    razon_social: string
    nombre_fantasia: string
    email: string
    telefono: string
    region: string
    ciudad: string
    representante_legal: string
    is_active: boolean
  }
  executives: Array<{
    id: string
    full_name: string
    rut: string
    email: string
    phone: string
    cargo: string
  }>
  drivers: Array<{
    id: string
    full_name: string
    rut: string
    email: string
    phone: string
    license_number: string
    license_type: string
  }>
  vehicles: Array<{
    id: string
    plate: string
    brand: string
    model: string
    year: number
    type: string
  }>
  subcontractors: Array<{
    rut: string
    nombre: string
    representante: string
    ejecutiva: string
    direccion: string
    comuna: string
    telefono: string
    email: string
    ariztia: boolean
    lts: boolean
    rendic: boolean
    interpolar: boolean
  }>
}

export default function CompanyDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[v0] Fetching complete Labbe data from API')
        const response = await fetch('/api/company/data')
        
        if (!response.ok) {
          throw new Error('No se pudo obtener los datos')
        }

        const result = await response.json()
        console.log('[v0] Data loaded:', {
          company: result.company?.razon_social,
          executives: result.executives?.length || 0,
          drivers: result.drivers?.length || 0,
          vehicles: result.vehicles?.length || 0,
        })
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        console.error('[v0] Error fetching data:', errorMessage)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Cargando datos de Transportes Labbe...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-red-950/20 border-red-500/50 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error || 'No se encontraron datos'}</p>
            <Button
              onClick={() => router.push('/auth/login-company')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, executives, drivers, vehicles } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">{company.nombre_fantasia}</h1>
              <p className="text-sm text-slate-400">{company.razon_social}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/auth/login-company')}
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">RUT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-orange-500">{company.rut}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Ejecutivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-green-500">{executives.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Conductores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-blue-500">{drivers.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-purple-500">{vehicles.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">Razón Social</p>
                <p className="text-lg font-semibold text-white">{company.razon_social}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Representante Legal</p>
                <p className="text-lg font-semibold text-white">{company.representante_legal}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white">{company.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Teléfono</p>
                <p className="text-white">{company.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Región</p>
                <p className="text-white">{company.region}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ciudad</p>
                <p className="text-white">{company.ciudad}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executives */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Ejecutivos ({executives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executives.length > 0 ? (
              <div className="space-y-4">
                {executives.map((exec) => (
                  <div key={exec.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{exec.full_name}</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>RUT: {exec.rut}</div>
                      <div>Cargo: {exec.cargo}</div>
                      <div>Email: {exec.email}</div>
                      <div>Teléfono: {exec.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay ejecutivos registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Drivers */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Conductores ({drivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drivers.length > 0 ? (
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{driver.full_name}</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>RUT: {driver.rut}</div>
                      <div>Licencia: {driver.license_number}</div>
                      <div>Email: {driver.email}</div>
                      <div>Teléfono: {driver.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay conductores registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              Vehículos ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="pb-4 border-b border-slate-700 last:border-0">
                    <p className="font-semibold text-white">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-400 mt-2">
                      <div>Patente: {vehicle.plate}</div>
                      <div>Tipo: {vehicle.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No hay vehículos registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Subcontractors */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Subcontratos ({data?.subcontractors?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.subcontractors && data.subcontractors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-2 text-slate-300">RUT</th>
                      <th className="text-left py-2 px-2 text-slate-300">Nombre</th>
                      <th className="text-left py-2 px-2 text-slate-300">Representante</th>
                      <th className="text-left py-2 px-2 text-slate-300">Ejecutiva</th>
                      <th className="text-left py-2 px-2 text-slate-300">Comuna</th>
                      <th className="text-left py-2 px-2 text-slate-300">Teléfono</th>
                      <th className="text-left py-2 px-2 text-slate-300">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subcontractors.slice(0, 20).map((sub, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-2 text-slate-300">{sub.rut}</td>
                        <td className="py-2 px-2 text-white font-medium">{sub.nombre}</td>
                        <td className="py-2 px-2 text-slate-300">{sub.representante}</td>
                        <td className="py-2 px-2 text-slate-400">{sub.ejecutiva}</td>
                        <td className="py-2 px-2 text-slate-400">{sub.comuna}</td>
                        <td className="py-2 px-2 text-slate-400">{sub.telefono}</td>
                        <td className="py-2 px-2 text-slate-400 truncate">{sub.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.subcontractors.length > 20 && (
                  <p className="mt-4 text-slate-400 text-sm">Mostrando 20 de {data.subcontractors.length} subcontratos</p>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No hay subcontratos registrados</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
