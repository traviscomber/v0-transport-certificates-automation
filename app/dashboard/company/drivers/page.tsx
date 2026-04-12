'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Driver {
  id: string
  rut: string
  full_name: string
  rut_proveedor?: string
  proveedor?: string
  patente_tracto?: string
  email?: string
  phone?: string
  is_active?: boolean
  organization_id?: string
}

export default function DriversPage() {
  const searchParams = useSearchParams()
  const organizationId = searchParams.get('organization_id')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (organizationId) {
          params.append('organization_id', organizationId)
        }
        
        const res = await fetch(`/api/drivers?${params.toString()}`)
        const data = await res.json()
        
        if (data.success && data.drivers) {
          // Sort by full_name
          const sorted = data.drivers.sort((a: Driver, b: Driver) => 
            (a.full_name || '').localeCompare(b.full_name || '')
          )
          setDrivers(sorted)
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDrivers()
  }, [organizationId])

  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (driver.full_name || '').toLowerCase().includes(searchLower) ||
      (driver.rut || '').toLowerCase().includes(searchLower) ||
      (driver.proveedor || '').toLowerCase().includes(searchLower) ||
      (driver.patente_tracto || '').toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando conductores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Conductores</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
              Total: {filteredDrivers.length} conductores
            </span>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, proveedor o patente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setView('cards')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>

        {/* Cards View */}
        {view === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver, index) => (
              <div
                key={driver.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition"
              >
                <div className="mb-3">
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    #{index + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Conductor</p>
                    <p className="font-semibold text-foreground">{driver.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">RUT</p>
                    <p className="text-sm text-foreground">{driver.rut}</p>
                  </div>
                  {driver.rut_proveedor && (
                    <div>
                      <p className="text-xs text-muted-foreground">RUT Proveedor</p>
                      <p className="text-sm text-foreground">{driver.rut_proveedor}</p>
                    </div>
                  )}
                  {driver.proveedor && (
                    <div>
                      <p className="text-xs text-muted-foreground">Proveedor</p>
                      <p className="text-sm text-foreground">{driver.proveedor}</p>
                    </div>
                  )}
                  {driver.patente_tracto && (
                    <div>
                      <p className="text-xs text-muted-foreground">Patente Tracto</p>
                      <p className="text-sm text-foreground font-mono">{driver.patente_tracto}</p>
                    </div>
                  )}
                  {driver.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{driver.email}</p>
                    </div>
                  )}
                  {driver.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm text-foreground">{driver.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Conductor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">RUT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">RUT Proveedor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Proveedor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Patente Tracto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, index) => (
                  <tr key={driver.id} className="border-b border-border hover:bg-secondary transition">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{driver.full_name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{driver.rut}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{driver.rut_proveedor || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{driver.proveedor || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{driver.patente_tracto || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{driver.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{driver.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No results */}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron conductores</p>
          </div>
        )}
      </div>
    </div>
  )
}
