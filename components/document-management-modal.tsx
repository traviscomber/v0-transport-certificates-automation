'use client'

import { useState, useRef } from 'react'
import { X, Upload, File, Trash2, CheckCircle, AlertCircle, Clock, Download, Eye } from 'lucide-react'

interface Document {
  id: string
  nombre: string
  tipo: string
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido'
  fecha_subida: string
  fecha_vencimiento?: string
  archivo_url?: string
}

interface Requirement {
  id: string
  code: string
  nombre: string
  category: string
  status: string
  descripcion?: string
  dias_vigencia?: number
}

interface DocumentManagementModalProps {
  subcontractorId: string
  subcontractorName: string
  requirements: Requirement[]
  uploadedDocuments: Document[]
  onClose: () => void
  onDocumentsUpdated?: () => void
}

export function DocumentManagementModal({
  subcontractorId,
  subcontractorName,
  requirements,
  uploadedDocuments,
  onClose,
  onDocumentsUpdated,
}: DocumentManagementModalProps) {
  const [documents, setDocuments] = useState<Document[]>(uploadedDocuments)
  const [uploading, setUploading] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobado':
        return 'text-green-400 bg-green-900/20 border-green-800'
      case 'pendiente':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
      case 'rechazado':
        return 'text-red-400 bg-red-900/20 border-red-800'
      case 'vencido':
        return 'text-orange-400 bg-orange-900/20 border-orange-800'
      default:
        return 'text-slate-400 bg-slate-900/20 border-slate-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente',
      rechazado: 'Rechazado',
      vencido: 'Vencido',
    }
    return labels[status] || status
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedRequirement) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('requirementId', selectedRequirement)
      formData.append('subcontractorId', subcontractorId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newDoc = await response.json()
        setDocuments([...documents, newDoc])
        setSelectedRequirement(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onDocumentsUpdated?.()
      }
    } catch (error) {
      console.error('[v0] Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('¿Eliminar este documento?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== documentId))
        onDocumentsUpdated?.()
      }
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-800 max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-white">Gestión de Documentos</h2>
            <p className="text-xs text-slate-400">{subcontractorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Upload Section */}
          <div className="space-y-3 p-4 bg-slate-800/50 rounded border border-slate-700">
            <h3 className="text-sm font-semibold text-white">Subir Documento</h3>
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">Seleccionar Requisito</label>
              <select
                value={selectedRequirement || ''}
                onChange={(e) => setSelectedRequirement(e.target.value || null)}
                className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm border border-slate-600 focus:outline-none focus:border-orange-500"
              >
                <option value="">Elegir documento a cargar...</option>
                {/* Group requirements by category */}
                {['Subcontratación', 'Empresa', 'certificaciones'].map((category) => {
                  const categoryReqs = requirements.filter((r) => r.category === category)
                  if (categoryReqs.length === 0) return null
                  
                  const categoryLabel = category === 'certificaciones' ? 'Certificaciones' : category
                  
                  return (
                    <optgroup key={category} label={categoryLabel}>
                      {categoryReqs.map((req) => (
                        <option key={req.id} value={req.id} className="bg-slate-800">
                          {req.code} - {req.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
            </div>
            <button
              onClick={() => selectedRequirement && fileInputRef.current?.click()}
              disabled={!selectedRequirement || uploading}
              className="w-full px-4 py-2 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2 border border-orange-500/30"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Cargando...' : 'Seleccionar Archivo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Documentos Cargados</h3>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No hay documentos cargados aún
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded border flex items-center justify-between ${getStatusColor(
                      doc.estado
                    )}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <File className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{doc.nombre}</p>
                        <p className="text-xs opacity-75">
                          {new Date(doc.fecha_subida).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-900/50 flex-shrink-0">
                        {getStatusLabel(doc.estado)}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {doc.archivo_url && (
                        <>
                          <a
                            href={`/api/documents/download?path=${encodeURIComponent(doc.archivo_url)}`}
                            download
                            className="p-1 hover:bg-slate-900/50 rounded transition-colors flex-shrink-0"
                            title="Descargar documento"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <a
                            href={`/api/documents/preview?path=${encodeURIComponent(doc.archivo_url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-900/50 rounded transition-colors flex-shrink-0"
                            title="Ver documento"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 hover:bg-slate-900/50 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements Status by Category */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-white">Estado de Requisitos</h3>
            
            {['Subcontratación', 'Empresa', 'certificaciones'].map((category) => {
              const categoryReqs = requirements.filter((r) => r.category === category)
              if (categoryReqs.length === 0) return null
              
              const categoryLabel = category === 'certificaciones' ? 'Certificaciones' : category
              
              const categoryComplete = categoryReqs.every((r) =>
                documents.some((d) => d.nombre.includes(r.code))
              )
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-semibold text-slate-300">{categoryLabel}</p>
                    <div className="text-xs px-2 py-1 rounded bg-slate-800">
                      {categoryReqs.filter((r) => documents.some((d) => d.nombre.includes(r.code))).length}/{categoryReqs.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-2">
                    {categoryReqs.map((req) => {
                      const hasDoc = documents.some((d) => d.nombre.includes(req.code))
                      return (
                        <div key={req.id} className="flex items-center gap-2 text-xs">
                          {hasDoc ? (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          )}
                          <span className={hasDoc ? 'text-slate-300' : 'text-slate-400'} title={req.nombre}>
                            {req.code}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
