/**
 * GESTIÓN DE DOCUMENTOS
 * 
 * Panel para visualizar y gestionar documentos requeridos mensualmente.
 * Aquí puedes:
 * - Ver todos los tipos de documentos que requiere tu operación
 * - Filtrar por certificación relacionada (Ariztia, LTS, Rendic, Interpolar)
 * - Identificar documentos extra requeridos por clientes
 * - Buscar documentos por nombre o descripción
 * - Entender qué es cada documento y por qué es importante
 * 
 * ¿Qué es un Documento? Certificado, registro, autorización o comprobante
 * que debe estar vigente para que tu operación sea legal y cumplida.
 */

'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Filter, X, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EducationalTooltip } from './educational-tooltip'
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
      {/* Header Educativo */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Gestión de Documentos</h2>
          <EducationalTooltip 
            title="¿Qué es un Documento?"
            content="Certificado, registro, autorización o comprobante que debe estar vigente para que tu operación sea legal y cumplida. Cada documento tiene periodicidad (mensual, anual, etc)."
          />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Visualiza todos los documentos requeridos en tu operación. Filtra por certificación, busca documentos específicos e identifica qué documentos extra solicitan tus clientes.
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-foreground">{allMonthlyDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Total de Documentos</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-400">{certifications.length}</div>
            <p className="text-xs text-blue-300">Certificaciones</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/20 border-orange-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-400">{allMonthlyDocuments.filter(d => d.docExtraClienteRequerido).length}</div>
            <p className="text-xs text-orange-300">Docs Extra</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">Resultados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar con Educación */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Buscar Documentos</h3>
          <EducationalTooltip 
            title="¿Cómo buscar?"
            content="Busca por nombre del documento (ej: Licencia) o descripción. La búsqueda es instantánea y caso-insensible."
            size="sm"
          />
        </div>
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
            {(selectedCertifications.length > 0 || showExtraDocsOnly) && (
              <Badge className="bg-red-500 text-white ml-1">{selectedCertifications.length + (showExtraDocsOnly ? 1 : 0)}</Badge>
            )}
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
      </div>

      {/* Advanced Filters con Educación */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          {/* Certifications Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-semibold text-slate-300">Certificaciones ({selectedCertifications.length})</label>
              <EducationalTooltip 
                title="¿Qué son las Certificaciones?"
                content="Acreditaciones de cumplimiento normativo: Ariztia (asociación de transporte), LTS (licencia técnica), Rendic (declaración de rentas), Interpolar (verificación internacional)."
                size="sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map(cert => (
                <button
                  key={cert}
                  onClick={() => toggleCertification(cert)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCertifications.includes(cert)
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Documents Filter */}
          <div>
            <button
              onClick={() => setShowExtraDocsOnly(!showExtraDocsOnly)}
              className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-between ${
                showExtraDocsOnly
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Solo Documentos Extra (Clientes)</span>
              </div>
              <EducationalTooltip 
                title="¿Qué son Documentos Extra?"
                content="Documentos adicionales que solicitan algunos clientes específicos. Más allá de los requerimientos legales estándar."
                size="sm"
              />
            </button>
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
              {/* Description */}
              {doc.descripcion && (
                <p className="text-sm text-slate-400 leading-relaxed">{doc.descripcion}</p>
              )}

              {/* Periodicidad */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  Periodicidad
                  <EducationalTooltip 
                    title="¿Qué es Periodicidad?"
                    content="Con qué frecuencia debe renovarse o verificarse el documento. Mensual = cada mes. Anual = cada año. Vigencia = mientras sea válido."
                    size="xs"
                  />
                </p>
                <Badge className="bg-blue-500/20 text-blue-300">{doc.periodicidad}</Badge>
              </div>

              {/* Certificaciones */}
              {doc.certificacionesRelacionadas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">Certificaciones</p>
                  <div className="flex flex-wrap gap-1">
                    {doc.certificacionesRelacionadas.map(cert => (
                      <Badge key={cert} className="bg-slate-700 text-slate-200 text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Document Badge */}
              {doc.docExtraClienteRequerido && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded border border-orange-500/30">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-300">Documento Extra (Cliente)</span>
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
