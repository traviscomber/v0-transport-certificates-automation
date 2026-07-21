import { useState } from 'react'
import { Search, X, Upload, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDocumentSelector } from '@/hooks/use-document-selector'
import { getDefaultDocumentPeriod } from '@/lib/document-period'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onDocumentSelected: (documentType: any, file: File, metadata: any) => Promise<void>
  driverRut: string
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentSelected,
  driverRut,
}: DocumentUploadModalProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    toggleTag,
    categories,
    availableTags,
    filteredDocuments,
    clearFilters,
  } = useDocumentSelector()

  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    document_number: '',
    expiry_date: '',
    provider: '',
    notes: '',
    document_period_month: String(getDefaultDocumentPeriod().month),
    document_period_year: String(getDefaultDocumentPeriod().year),
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleDocumentSelect = (doc: any) => {
    setSelectedDoc(doc)
    setUploadFile(null)
    setError('')
    setMetadata({
      document_number: '',
      expiry_date: '',
      provider: '',
      notes: '',
      document_period_month: String(getDefaultDocumentPeriod().month),
      document_period_year: String(getDefaultDocumentPeriod().year),
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedDoc || !uploadFile) {
      setError('Por favor selecciona un documento y sube un archivo')
      return
    }

    setUploading(true)
    try {
      await onDocumentSelected(selectedDoc, uploadFile, {
        ...metadata,
        category: selectedDoc.category,
        tags: selectedDoc.tags,
      })
      // Reset
      setSelectedDoc(null)
      setUploadFile(null)
      setMetadata({
        document_number: '',
        expiry_date: '',
        provider: '',
        notes: '',
        document_period_month: String(getDefaultDocumentPeriod().month),
        document_period_year: String(getDefaultDocumentPeriod().year),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el documento')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Subir Documento</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex gap-4 p-4">
          {/* Left: Document List */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            {/* Filters */}
            <div className="space-y-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-300 text-sm"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Tag Filters */}
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentSelect(doc)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedDoc?.id === doc.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs opacity-75 truncate">{doc.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.category}
                          </Badge>
                          {doc.tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedDoc?.id === doc.id && (
                        <ChevronRight className="h-5 w-5 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No se encontraron documentos</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Upload Form */}
          <div className="w-80 border-l border-slate-700 pl-4 flex flex-col gap-4">
            {selectedDoc ? (
              <>
                {/* Selected Document Info */}
                <div className="bg-slate-800 rounded p-3">
                  <h3 className="font-bold text-white mb-2">{selectedDoc.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">{selectedDoc.description}</p>
                  {selectedDoc.required && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Documento obligatorio
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Archivo
                  </label>
                  <label className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-slate-500 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      {uploadFile ? uploadFile.name : 'Haz clic para seleccionar archivo'}
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-2">
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                    <label className="block text-xs font-semibold text-orange-100 mb-2">
                      Periodo del documento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={metadata.document_period_month}
                        onChange={(e) => setMetadata({ ...metadata, document_period_month: e.target.value })}
                        className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                      >
                        <option value="1">Enero</option>
                        <option value="2">Febrero</option>
                        <option value="3">Marzo</option>
                        <option value="4">Abril</option>
                        <option value="5">Mayo</option>
                        <option value="6">Junio</option>
                        <option value="7">Julio</option>
                        <option value="8">Agosto</option>
                        <option value="9">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                      </select>
                      <Input
                        type="number"
                        min="2020"
                        max="2100"
                        value={metadata.document_period_year}
                        onChange={(e) => setMetadata({ ...metadata, document_period_year: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white text-sm"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-orange-100/80">
                      Se usa para cumplimiento mensual y no cambia al aprobar.
                    </p>
                  </div>

                  {selectedDoc.fields?.includes('document_number') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Número de documento
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: LC-123456"
                        value={metadata.document_number}
                        onChange={(e) => setMetadata({ ...metadata, document_number: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white text-sm"
                      />
                    </div>
                  )}

                  {selectedDoc.fields?.includes('expiry_date') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Fecha de vencimiento
                      </label>
                      <Input
                        type="date"
                        value={metadata.expiry_date}
                        onChange={(e) => setMetadata({ ...metadata, expiry_date: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white text-sm"
                      />
                    </div>
                  )}

                  {selectedDoc.fields?.includes('provider') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Proveedor/Emisor
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: Municipalidad de X"
                        value={metadata.provider}
                        onChange={(e) => setMetadata({ ...metadata, provider: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white text-sm"
                      />
                    </div>
                  )}

                  {selectedDoc.fields?.includes('notes') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        placeholder="Observaciones adicionales..."
                        value={metadata.notes}
                        onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 rounded p-2 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Selecciona un documento para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
