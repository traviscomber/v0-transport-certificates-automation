'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Search, Filter, Calendar, User, FileCheck, X } from 'lucide-react'

interface DocumentResult {
  id: string
  file_name: string
  document_type_id: string
  type_code: string
  subcontractor_id: string
  subcontractor_name: string
  subcontractor_rut: string
  status: 'approved' | 'pending' | 'rejected' | 'expired'
  created_at: string
  file_url: string
}

interface SearchFilters {
  query: string
  rut: string
  documentType: string
  status: string
  dateFrom: string
  dateTo: string
}

const STATUS_OPTIONS = ['approved', 'pending', 'rejected', 'expired']
const STATUS_LABELS = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  expired: 'Vencido'
}

const STATUS_COLORS = {
  approved: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
  expired: 'bg-orange-500/20 text-orange-300'
}

export default function GlobalSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    rut: '',
    documentType: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [results, setResults] = useState<DocumentResult[]>([])
  const [loading, setLoading] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<{ id: string; code: string }[]>([])
  const [totalResults, setTotalResults] = useState(0)

  // Load document types on mount
  useEffect(() => {
    async function loadDocumentTypes() {
      try {
        const response = await fetch('/api/subcontractor-document-types?active=true')
        if (response.ok) {
          const data = await response.json()
          setDocumentTypes(data || [])
        }
      } catch (error) {
        console.error('Error loading document types:', error)
      }
    }
    loadDocumentTypes()
  }, [])

  // Search documents
  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append('query', filters.query)
      if (filters.rut) params.append('rut', filters.rut)
      if (filters.documentType) params.append('documentType', filters.documentType)
      if (filters.status) params.append('status', filters.status)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/documents/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setTotalResults(data.total || 0)
      }
    } catch (error) {
      console.error('Error searching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset filters
  const handleReset = () => {
    setFilters({
      query: '',
      rut: '',
      documentType: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    })
    setResults([])
  }

  // Check if any filter is active
  const hasActiveFilters = filters.query || filters.rut || filters.documentType || filters.status || filters.dateFrom || filters.dateTo

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Búsqueda Global de Documentos</h1>
          <p className="text-muted-foreground">Busca documentos por RUT, nombre, tipo, estado y fecha</p>
        </div>

        {/* Search Filters */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Query */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block">
                  Búsqueda (Nombre, Subcontratista)
                </label>
                <Input
                  placeholder="Ej: liquidacion, transportes..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* RUT Filter */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  RUT del Subcontratista
                </label>
                <Input
                  placeholder="Ej: 12.345.678-9"
                  value={filters.rut}
                  onChange={(e) => setFilters({ ...filters, rut: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Tipo de Documento
                </label>
                <select
                  value={filters.documentType}
                  onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                >
                  <option value="">Todos los tipos</option>
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.code}>{type.code}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                >
                  <option value="">Todos los estados</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium text-slate-200 mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasActiveFilters && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Resultados ({totalResults})
              </h2>
              {loading && <span className="text-sm text-muted-foreground">Buscando...</span>}
            </div>

            {loading ? (
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">Buscando documentos...</div>
                </CardContent>
              </Card>
            ) : results.length === 0 ? (
              <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <div className="text-foreground font-semibold">Sin resultados</div>
                  <div className="text-muted-foreground">Intenta con otros filtros</div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map(doc => (
                  <Card key={doc.id} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">{doc.file_name}</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="text-slate-400">Subcontratista:</span> {doc.subcontractor_name}
                            </div>
                            <div>
                              <span className="text-slate-400">RUT:</span> {doc.subcontractor_rut}
                            </div>
                            <div>
                              <span className="text-slate-400">Tipo:</span> {doc.type_code}
                            </div>
                            <div>
                              <span className="text-slate-400">Fecha:</span> {new Date(doc.created_at).toLocaleDateString('es-CL')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS]}>
                              {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-shrink-0"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasActiveFilters && (
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <div className="text-foreground font-semibold">Comienza tu búsqueda</div>
              <div className="text-muted-foreground">Usa los filtros arriba para buscar documentos</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
