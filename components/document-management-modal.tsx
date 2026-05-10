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
      <div className="bg-slate-900 rounded-lg border border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
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
          {/* Upload Section - Compact */}
          <div className="space-y-2 p-3 bg-slate-800/50 rounded border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">Subir Documento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={selectedRequirement || ''}
                onChange={(e) => setSelectedRequirement(e.target.value || null)}
                className="px-3 py-2 rounded bg-slate-700 text-white text-sm border border-slate-600 focus:outline-none focus:border-orange-500 md:col-span-1"
              >
                <option value="">Elegir documento...</option>
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
              <button
                onClick={() => selectedRequirement && fileInputRef.current?.click()}
                disabled={!selectedRequirement || uploading}
                className="px-4 py-2 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2 border border-orange-500/30"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Cargando...' : 'Seleccionar'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </div>

          {/* Uploaded Documents List - Full History */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Historial de Documentos</h3>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {documents.length} documento{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {documents.length === 0 ? (
              <div className="p-4 text-center bg-slate-900/30 border border-slate-700 rounded">
                <p className="text-xs text-slate-400">No hay documentos cargados aún</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded border flex items-center justify-between transition-all hover:bg-slate-800/50 ${getStatusColor(
                      doc.estado
                    )}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{doc.nombre}</p>
                          <span className="text-xs text-slate-400 flex-shrink-0">({index + 1})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <p>{new Date(doc.fecha_subida).toLocaleDateString('es-CL')} a las {new Date(doc.fecha_subida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                      <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-900/50">
                        {getStatusLabel(doc.estado)}
                      </div>
                      
                      <div className="flex gap-1">
                        {doc.archivo_url && (
                          <>
                            <a
                              href={`/api/documents/download?path=${encodeURIComponent(doc.archivo_url)}`}
                              download
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <a
                              href={`/api/documents/preview?path=${encodeURIComponent(doc.archivo_url)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                              title="Ver"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 hover:bg-red-900/50 rounded transition-colors flex-shrink-0 text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements Status by Category - Collapsed Section */}
          <div className="space-y-2 p-3 bg-slate-800/30 rounded border border-slate-700/50">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Resumen de Requisitos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Subcontratación', 'Empresa', 'certificaciones'].map((category) => {
                const categoryReqs = requirements.filter((r) => r.category === category)
                if (categoryReqs.length === 0) return null
                
                const categoryLabel = category === 'certificaciones' ? 'Certificaciones' : category
                const completed = categoryReqs.filter((r) => documents.some((d) => d.nombre.includes(r.code))).length
                const total = categoryReqs.length
                const percentage = Math.round((completed / total) * 100)
                
                return (
                  <div key={category} className="flex items-center justify-between px-2 py-1 bg-slate-900/30 rounded border border-slate-700/50">
                    <span className="text-xs font-medium text-slate-300">{categoryLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-orange-400">{completed}/{total}</div>
                      <div className={`text-xs px-1.5 py-0.5 rounded ${
                        percentage === 100 ? 'bg-green-500/20 text-green-400' : 
                        percentage > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
