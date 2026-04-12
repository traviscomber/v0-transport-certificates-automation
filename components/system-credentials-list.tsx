'use client'

import { useState, useMemo } from 'react'
import { Search, Eye, EyeOff, Copy, Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { allSystemCredentials } from '@/lib/data/system-credentials'

export function SystemCredentialsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEjecutivas, setSelectedEjecutivas] = useState<string[]>([])
  const [selectedPlataformas, setSelectedPlataformas] = useState<string[]>([])
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Get unique values for filters
  const ejecutivas = useMemo(
    () => Array.from(new Set(allSystemCredentials.map(c => c.ejecutiva))).sort(),
    []
  )
  const plataformas = useMemo(
    () => Array.from(new Set(allSystemCredentials.map(c => c.plataforma))).sort(),
    []
  )
  const clientes = useMemo(
    () => Array.from(new Set(allSystemCredentials.map(c => c.cliente))).sort(),
    []
  )

  // Smart search and filtering
  const filtered = useMemo(() => {
    return allSystemCredentials.filter(cred => {
      // Search term filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
          cred.ejecutiva.toLowerCase().includes(query) ||
          cred.razonSocial.toLowerCase().includes(query) ||
          cred.rut.toLowerCase().includes(query) ||
          cred.plataforma.toLowerCase().includes(query) ||
          cred.cliente.toLowerCase().includes(query) ||
          cred.usuario.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Ejecutiva filter
      if (selectedEjecutivas.length > 0 && !selectedEjecutivas.includes(cred.ejecutiva)) {
        return false
      }

      // Plataforma filter
      if (selectedPlataformas.length > 0 && !selectedPlataformas.includes(cred.plataforma)) {
        return false
      }

      // Cliente filter
      if (selectedClientes.length > 0 && !selectedClientes.includes(cred.cliente)) {
        return false
      }

      return true
    })
  }, [searchTerm, selectedEjecutivas, selectedPlataformas, selectedClientes])

  // Toggle filter functions
  const toggleEjecutiva = (ejecutiva: string) => {
    setSelectedEjecutivas(prev =>
      prev.includes(ejecutiva) ? prev.filter(e => e !== ejecutiva) : [...prev, ejecutiva]
    )
  }

  const togglePlataforma = (plataforma: string) => {
    setSelectedPlataformas(prev =>
      prev.includes(plataforma) ? prev.filter(p => p !== plataforma) : [...prev, plataforma]
    )
  }

  const toggleCliente = (cliente: string) => {
    setSelectedClientes(prev =>
      prev.includes(cliente) ? prev.filter(c => c !== cliente) : [...prev, cliente]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedEjecutivas([])
    setSelectedPlataformas([])
    setSelectedClientes([])
  }

  const togglePassword = (index: number) => {
    const newShowPasswords = new Set(showPasswords)
    if (newShowPasswords.has(`${index}`)) {
      newShowPasswords.delete(`${index}`)
    } else {
      newShowPasswords.add(`${index}`)
    }
    setShowPasswords(newShowPasswords)
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const hasActiveFilters = searchTerm || selectedEjecutivas.length > 0 || selectedPlataformas.length > 0 || selectedClientes.length > 0

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por ejecutiva, empresa, plataforma, cliente o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500"
          />
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded border transition-colors flex items-center gap-2 ${
            showAdvancedFilters
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Limpiar todos los filtros"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          {/* Ejecutivas Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Ejecutivas ({selectedEjecutivas.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {ejecutivas.map(ejecutiva => (
                <button
                  key={ejecutiva}
                  onClick={() => toggleEjecutiva(ejecutiva)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedEjecutivas.includes(ejecutiva)
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ejecutiva}
                </button>
              ))}
            </div>
          </div>

          {/* Plataformas Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Plataformas ({selectedPlataformas.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {plataformas.map(plataforma => (
                <button
                  key={plataforma}
                  onClick={() => togglePlataforma(plataforma)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedPlataformas.includes(plataforma)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {plataforma}
                </button>
              ))}
            </div>
          </div>

          {/* Clientes Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Clientes ({selectedClientes.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {clientes.map(cliente => (
                <button
                  key={cliente}
                  onClick={() => toggleCliente(cliente)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedClientes.includes(cliente)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cliente}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mostrando <span className="font-semibold text-orange-400">{filtered.length}</span> de{' '}
          <span className="font-semibold">{allSystemCredentials.length}</span> credenciales
          {hasActiveFilters && <span className="ml-2 text-slate-500">(filtrado)</span>}
        </div>
      </div>

      {/* Credentials Table */}
      <div className="space-y-3">
        {filtered.map((cred, index) => (
          <Card key={`${cred.razonSocial}-${cred.plataforma}-${index}`} className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-colors">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ejecutiva</p>
                    <p className="text-sm font-medium text-orange-400">{cred.ejecutiva}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Empresa</p>
                    <p className="text-sm text-slate-200">{cred.razonSocial}</p>
                  </div>
                  {cred.rut && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">RUT</p>
                      <p className="text-sm text-slate-300">{cred.rut}</p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Plataforma</p>
                    <p className="text-sm font-medium text-blue-400">{cred.plataforma}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Cliente</p>
                    <p className="text-sm font-medium text-green-400">{cred.cliente}</p>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Usuario</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-slate-800 px-3 py-1.5 rounded text-slate-200 flex-1 font-mono">
                      {cred.usuario}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.usuario, index)}
                      className="p-2 hover:bg-slate-800 rounded transition-colors"
                      title="Copiar usuario"
                    >
                      <Copy className={`w-4 h-4 ${copiedIndex === index ? 'text-green-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Contraseña</p>
                    <button
                      onClick={() => togglePassword(index)}
                      className="p-1 hover:bg-slate-800 rounded transition-colors"
                      title={showPasswords.has(`${index}`) ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPasswords.has(`${index}`) ? (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-slate-800 px-3 py-1.5 rounded text-slate-200 flex-1 font-mono">
                      {showPasswords.has(`${index}`) ? cred.contraseña : '••••••••'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.contraseña, index)}
                      className="p-2 hover:bg-slate-800 rounded transition-colors"
                      title="Copiar contraseña"
                    >
                      <Copy className={`w-4 h-4 ${copiedIndex === index ? 'text-green-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No se encontraron credenciales que coincidan con tu búsqueda</p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
