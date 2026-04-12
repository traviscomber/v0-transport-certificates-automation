'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Filter, X, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { allMonthlyDocuments } from '@/lib/data/monthly-documents'

export function MonthlyDocumentsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [showExtraDocsOnly, setShowExtraDocsOnly] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Get unique certifications
  const certifications = useMemo(() => {
    const certs = new Set<string>()
    allMonthlyDocuments.forEach(doc => {
      doc.certificacionesRelacionadas.forEach(cert => certs.add(cert))
    })
    return Array.from(certs).sort()
  }, [])

  // Filter documents
  const filtered = useMemo(() => {
    return allMonthlyDocuments.filter(doc => {
      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
          doc.nombre.toLowerCase().includes(query) ||
          doc.descripcion?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Extra docs filter
      if (showExtraDocsOnly && !doc.docExtraClienteRequerido) {
        return false
      }

      // Certifications filter
      if (selectedCertifications.length > 0) {
        const hasCertification = selectedCertifications.some(cert =>
          doc.certificacionesRelacionadas.includes(cert)
        )
        if (!hasCertification) return false
      }

      return true
    })
  }, [searchTerm, selectedCertifications, showExtraDocsOnly])

  // Toggle functions
  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCertifications([])
    setShowExtraDocsOnly(false)
  }

  const hasActiveFilters = searchTerm || selectedCertifications.length > 0 || showExtraDocsOnly

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre o descripción..."
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
          {/* Certifications Filter */}
          {certifications.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">
                Certificaciones Relacionadas ({selectedCertifications.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {certifications.map(cert => (
                  <button
                    key={cert}
                    onClick={() => toggleCertification(cert)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedCertifications.includes(cert)
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extra Docs Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExtraDocsOnly}
                onChange={(e) => setShowExtraDocsOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800"
              />
              <span className="text-sm text-slate-300">Solo documentos extra por cliente</span>
            </label>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Mostrando <span className="font-semibold text-orange-400">{filtered.length}</span> de{' '}
          <span className="font-semibold">{allMonthlyDocuments.length}</span> documentos
          {hasActiveFilters && <span className="ml-2 text-slate-500">(filtrado)</span>}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <Card key={doc.id} className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base text-white">{doc.nombre}</CardTitle>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Descripción */}
              {doc.descripcion && (
                <div>
                  <p className="text-sm text-slate-300">{doc.descripcion}</p>
                </div>
              )}

              {/* Extra por cliente */}
              {doc.docExtraClienteRequerido && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900 bg-opacity-30 rounded border border-yellow-700">
                  <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-yellow-300">Doc. Extra por cliente</span>
                </div>
              )}

              {/* Certificaciones */}
              {doc.certificacionesRelacionadas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Certificaciones Relacionadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.certificacionesRelacionadas.map(cert => (
                      <Badge key={cert} variant="outline" className="bg-green-900 text-green-200 border-green-700 text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No se encontraron documentos que coincidan con tu búsqueda</p>
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
