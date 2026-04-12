'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Vehicle {
  id: string
  patente: string
  marca: string
  modelo: string
  año: number
  propietario: string
  revistaVencimiento: string
  segurosVencimiento: string
  permisoVencimiento: string
  estado: 'ok' | 'riesgo' | 'bloqueado'
}

const mockVehicles: Vehicle[] = [
  { id: '1', patente: 'XW7026', marca: 'Volvo', modelo: 'FH16', año: 2018, propietario: 'Ruben Marchant', revistaVencimiento: '2026-05-15', segurosVencimiento: '2026-06-20', permisoVencimiento: '2026-07-10', estado: 'ok' },
  { id: '2', patente: 'FWKB83', marca: 'Volvo', modelo: 'FM', año: 2019, propietario: 'Adolfo Gonzalez', revistaVencimiento: '2026-04-20', segurosVencimiento: '2026-04-15', permisoVencimiento: '2026-05-01', estado: 'riesgo' },
  { id: '3', patente: 'RVSD35', marca: 'Scania', modelo: 'G440', año: 2020, propietario: 'Juan Vargas', revistaVencimiento: '2026-04-10', segurosVencimiento: '2026-03-30', permisoVencimiento: '2026-04-05', estado: 'bloqueado' },
  { id: '4', patente: 'CHTV35', marca: 'Mercedes', modelo: 'Actros', año: 2017, propietario: 'Aldo Bustamante', revistaVencimiento: '2026-05-25', segurosVencimiento: '2026-06-15', permisoVencimiento: '2026-07-20', estado: 'ok' },
  { id: '5', patente: 'HWRC63', marca: 'Volvo', modelo: 'FH16', año: 2018, propietario: 'Ambrosio Casanova', revistaVencimiento: '2026-04-18', segurosVencimiento: '2026-04-10', permisoVencimiento: '2026-05-05', estado: 'riesgo' },
]

export default function VehiculosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEstado, setSelectedEstado] = useState<'all' | 'ok' | 'riesgo' | 'bloqueado'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return mockVehicles.filter(v => {
      const matchSearch = searchTerm === '' || 
        v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchEstado = selectedEstado === 'all' || v.estado === selectedEstado
      
      return matchSearch && matchEstado
    })
  }, [searchTerm, selectedEstado])

  const stats = {
    total: mockVehicles.length,
    ok: mockVehicles.filter(v => v.estado === 'ok').length,
    riesgo: mockVehicles.filter(v => v.estado === 'riesgo').length,
    bloqueado: mockVehicles.filter(v => v.estado === 'bloqueado').length,
  }

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'ok': return { bg: 'bg-green-50', border: 'border-l-green-600', text: 'text-green-900', badge: 'bg-green-100 text-green-800' }
      case 'riesgo': return { bg: 'bg-amber-50', border: 'border-l-amber-600', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' }
      case 'bloqueado': return { bg: 'bg-red-50', border: 'border-l-red-600', text: 'text-red-900', badge: 'bg-red-100 text-red-800' }
      default: return { bg: 'bg-gray-50', border: 'border-l-gray-600', text: 'text-gray-900', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600 mt-1">Gestión de flota y documentación de transportes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-sm text-green-600">Vigentes</p>
              <p className="text-3xl font-bold text-green-900">{stats.ok}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-600">En Riesgo</p>
              <p className="text-3xl font-bold text-amber-900">{stats.riesgo}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">Bloqueados</p>
              <p className="text-3xl font-bold text-red-900">{stats.bloqueado}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por patente, propietario o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filtros
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => setSelectedEstado('all')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedEstado === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedEstado('ok')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedEstado === 'ok' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Vigentes
                </button>
                <button
                  onClick={() => setSelectedEstado('riesgo')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedEstado === 'riesgo' ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  En Riesgo
                </button>
                <button
                  onClick={() => setSelectedEstado('bloqueado')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedEstado === 'bloqueado' ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Bloqueados
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicles List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No se encontraron vehículos</p>
          ) : (
            filtered.map(vehicle => {
              const colors = getEstadoColor(vehicle.estado)
              return (
                <Card key={vehicle.id} className={`border-l-4 ${colors.border}`}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">{vehicle.patente}</p>
                          <p className="text-sm text-gray-600">{vehicle.marca} {vehicle.modelo} ({vehicle.año})</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {vehicle.estado === 'ok' ? 'VIGENTE' : vehicle.estado === 'riesgo' ? 'EN RIESGO' : 'BLOQUEADO'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Propietario: {vehicle.propietario}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Revisión: {new Date(vehicle.revistaVencimiento).toLocaleDateString()}</p>
                        <p>Seguros: {new Date(vehicle.segurosVencimiento).toLocaleDateString()}</p>
                        <p>Permiso: {new Date(vehicle.permisoVencimiento).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DocuFleetLayout>
  )
}
