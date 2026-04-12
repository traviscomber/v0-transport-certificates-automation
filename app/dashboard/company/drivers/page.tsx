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

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/company/data?type=drivers', {
          signal: AbortSignal.timeout(5000)
        })
        if (!response.ok) throw new Error('Failed to fetch drivers')
        const data = await response.json()
        setDrivers(data.drivers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading drivers')
      } finally {
        setLoading(false)
      }
    }
    fetchDrivers()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => (
              <div
                key={driver.id}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/60 transition"
              >
                <p className="font-semibold text-slate-100">
                  {driver.first_name} {driver.last_name}
                </p>
                <p className="text-slate-400 text-sm">RUT: {driver.rut}</p>
                <p className="text-slate-400 text-sm truncate">{driver.email}</p>
                {driver.phone && (
                  <p className="text-slate-400 text-sm">{driver.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
