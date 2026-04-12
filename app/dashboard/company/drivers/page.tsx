'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  rut: string
  email: string
  phone: string
  first_name: string
  last_name: string
  organization_id: string
}

interface DriverWithOrg extends Driver {
  organization_name?: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<DriverWithOrg[]>([])
  const [organizations, setOrganizations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drivers
        const driversResponse = await fetch('/api/company/data?type=drivers', {
          signal: AbortSignal.timeout(5000)
        })
        if (!driversResponse.ok) throw new Error('Failed to fetch drivers')
        const driversData = await driversResponse.json()
        
        // Fetch organizations
        const orgsResponse = await fetch('/api/company/data?type=organizations', {
          signal: AbortSignal.timeout(5000)
        })
        if (!orgsResponse.ok) throw new Error('Failed to fetch organizations')
        const orgsData = await orgsResponse.json()
        
        // Create organization map
        const orgMap: Record<string, string> = {}
        if (orgsData.organizations) {
          orgsData.organizations.forEach((org: any) => {
            orgMap[org.id] = org.name
          })
        }
        
        // Enrich drivers with organization names
        const enrichedDrivers = (driversData.drivers || []).map((driver: Driver) => ({
          ...driver,
          organization_name: orgMap[driver.organization_id] || 'Sin asignar'
        }))
        
        setOrganizations(orgMap)
        setDrivers(enrichedDrivers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              <h1 className="text-3xl font-bold text-slate-100">Conductores</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Total: {drivers.length} conductores registrados
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Cargando conductores...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-700 text-red-200 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No hay conductores registrados</p>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Nombre Completo</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">RUT</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Teléfono</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Empresa / Subcontratista</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver, idx) => (
                    <tr
                      key={driver.id}
                      className="border-b border-slate-700 hover:bg-slate-800/40 transition"
                    >
                      <td className="px-6 py-3 text-slate-100">
                        {driver.first_name} {driver.last_name}
                      </td>
                      <td className="px-6 py-3 text-slate-400 font-mono">
                        {driver.rut}
                      </td>
                      <td className="px-6 py-3 text-slate-400 truncate">
                        {driver.email}
                      </td>
                      <td className="px-6 py-3 text-slate-400">
                        {driver.phone || '-'}
                      </td>
                      <td className="px-6 py-3 text-slate-300 font-medium">
                        {driver.organization_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
