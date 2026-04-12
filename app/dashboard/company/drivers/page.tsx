'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, List, Grid3x3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  rut: string
  full_name: string
  rut_proveedor?: string
  proveedor?: string
  patente_tracto?: string
  license_type?: string
  is_active?: boolean
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    filterDrivers()
  }, [searchTerm, drivers])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/drivers')
      if (!response.ok) throw new Error('Failed to fetch drivers')
      const data = await response.json()
      setDrivers(data.drivers || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading drivers')
    } finally {
      setLoading(false)
    }
  }

  const filterDrivers = () => {
    if (!searchTerm.trim()) {
      setFilteredDrivers(drivers)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = drivers.filter(driver =>
      driver.rut?.toLowerCase().includes(term) ||
      driver.full_name?.toLowerCase().includes(term) ||
      driver.rut_proveedor?.toLowerCase().includes(term) ||
      driver.proveedor?.toLowerCase().includes(term) ||
      driver.patente_tracto?.toLowerCase().includes(term)
    )
    setFilteredDrivers(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Conductores</h1>
              <p className="text-slate-400 text-sm mt-1">
                Total: {drivers.length} • Mostrando: {filteredDrivers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por RUT, nombre, proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
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
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {drivers.length === 0 ? 'No hay conductores registrados' : 'No se encontraron resultados'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver, index) => (
              <div
                key={driver.id}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-slate-100 font-semibold text-sm">{driver.full_name}</h3>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500">RUT Conductor</p>
                    <p className="text-slate-200 font-mono font-semibold">{driver.rut}</p>
                  </div>
                  {driver.rut_proveedor && (
                    <div>
                      <p className="text-slate-500">RUT Proveedor</p>
                      <p className="text-slate-200 font-mono">{driver.rut_proveedor}</p>
                    </div>
                  )}
                  {driver.proveedor && (
                    <div>
                      <p className="text-slate-500">Proveedor</p>
                      <p className="text-slate-200 truncate">{driver.proveedor}</p>
                    </div>
                  )}
                  {driver.patente_tracto && (
                    <div>
                      <p className="text-slate-500">Patente Tracto</p>
                      <p className="text-slate-200 font-semibold">{driver.patente_tracto}</p>
                    </div>
                  )}
                  {driver.license_type && (
                    <div>
                      <p className="text-slate-500">Clase Licencia</p>
                      <p className="text-slate-200">{driver.license_type}</p>
                    </div>
                  )}
                  {driver.is_active !== undefined && (
                    <div className="pt-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        driver.is_active
                          ? 'bg-green-900/30 text-green-400 border border-green-700'
                          : 'bg-red-900/30 text-red-400 border border-red-700'
                      }`}>
                        {driver.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50 sticky top-0">
                    <th className="px-4 py-3 text-left font-semibold text-slate-300 w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Conductor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">RUT Conductor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">RUT Proveedor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Proveedor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Patente Tracto</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Clase Licencia</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-300">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver, index) => (
                    <tr
                      key={driver.id}
                      className="border-b border-slate-700 hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-2 text-slate-400 font-semibold">{index + 1}</td>
                      <td className="px-4 py-2 text-slate-100">{driver.full_name}</td>
                      <td className="px-4 py-2 text-slate-200 font-mono font-semibold">{driver.rut}</td>
                      <td className="px-4 py-2 text-slate-300 font-mono">{driver.rut_proveedor || '-'}</td>
                      <td className="px-4 py-2 text-slate-300 max-w-xs truncate">{driver.proveedor || '-'}</td>
                      <td className="px-4 py-2 text-slate-200 font-mono font-semibold">{driver.patente_tracto || '-'}</td>
                      <td className="px-4 py-2 text-slate-300">
                        {driver.license_type ? (
                          <span className="bg-slate-700 px-2 py-1 rounded text-xs">{driver.license_type}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {driver.is_active !== undefined && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            driver.is_active
                              ? 'bg-green-900/30 text-green-400 border border-green-700'
                              : 'bg-red-900/30 text-red-400 border border-red-700'
                          }`}>
                            {driver.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        )}
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
