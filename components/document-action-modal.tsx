'use client'

import { useState } from 'react'
import { X, Download, Eye, CheckCircle, XCircle, Clock, Loader, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentManagement } from '@/hooks/use-document-management'

interface Document {
  id: string
  tipo: string
  nombre: string
  fecha_subida: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  storage_path?: string
  public_url?: string
}

interface DocumentActionModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (documentId: string, newStatus: 'pendiente' | 'aprobado' | 'rechazado') => Promise<void>
  onDelete?: (documentId: string) => Promise<void>
  isAdmin?: boolean
}

export function DocumentActionModal({
  document,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  isAdmin = false,
}: DocumentActionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'aprobado' | 'rechazado' | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const { deleteDocument } = useDocumentManagement()

  if (!isOpen || !document) return null

  const handleStatusChange = async (newStatus: 'aprobado' | 'rechazado') => {
    if (!onStatusChange) return
    setIsChanging(true)
    try {
      await onStatusChange(document.id, newStatus)
      console.log('[v0] Document status changed to:', newStatus)
      setTimeout(() => onClose(), 1000)
    } catch (error) {
      console.error('[v0] Error changing status:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const handleDownload = () => {
    if (document.public_url) {
      window.open(document.public_url, '_blank')
    } else if (document.storage_path) {
      // Fallback if public_url not available
      const link = `/api/documents/download?path=${encodeURIComponent(document.storage_path)}`
      window.open(link, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!isAdmin) return
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return
    
    setIsDeleting(true)
    try {
      // Call delete endpoint directly by document ID — no storage_path needed
      const response = await fetch(`/api/company/documents/${document.id}/delete`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete document')
      }
      if (onDelete) {
        await onDelete(document.id)
      }
      onClose()
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
      alert('Error al eliminar el documento')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'text-green-400'
      case 'rechazado':
        return 'text-red-400'
      case 'pendiente':
        return 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado'
      case 'rechazado':
        return 'Rechazado'
      case 'pendiente':
        return 'Pendiente'
      default:
        return estado
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-900 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 space-y-6">
          {/* Document Header */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{document.tipo}</h2>
            <p className="text-slate-400 text-sm mb-4">{document.nombre}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm">
                <p className="text-slate-500">Fecha de carga</p>
                <p className="text-white">{new Date(document.fecha_subida).toLocaleDateString('es-ES')}</p>
              </div>
              <div className="text-sm">
                <p className="text-slate-500">Estado actual</p>
                <div className={`font-semibold ${getStatusColor(document.estado)}`}>
                  {getStatusLabel(document.estado)}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && document.public_url && (
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
              <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-300">Vista Previa</p>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 bg-slate-900 min-h-64 flex items-center justify-center overflow-auto max-h-96">
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-slate-500 mb-2 absolute top-2 right-2 bg-slate-800 p-2 rounded max-w-xs">
                    URL: {document.public_url?.substring(0, 50)}...
                  </div>
                )}
                
                {/* Image Preview */}
                {document.public_url ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <img
                      src={document.public_url}
                      alt={document.nombre}
                      className="max-w-full max-h-96 object-contain rounded"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('[v0] Image failed to load:', document.public_url)
                        e.currentTarget.style.display = 'none'
                        const errorMsg = e.currentTarget.nextElementSibling as HTMLElement
                        if (errorMsg) errorMsg.style.display = 'block'
                      }}
                      onLoad={() => {
                        console.log('[v0] Image loaded successfully:', document.public_url)
                      }}
                    />
                    <div className="hidden text-center py-8 w-full">
                      <Eye className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">No se pudo cargar la vista previa</p>
                      <p className="text-slate-500 text-sm mt-1">{document.nombre}</p>
                      <p className="text-slate-600 text-xs mt-2 break-all">{document.public_url}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 w-full">
                    <Eye className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">URL no disponible</p>
                    <p className="text-slate-500 text-sm mt-1">{document.nombre}</p>
                    <p className="text-slate-600 text-xs mt-2">Storage Path: {document.storage_path}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!document.public_url && !document.storage_path}
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>

            {isAdmin && document.estado === 'pendiente' && (
              <>
                <Button
                  onClick={() => handleStatusChange('aprobado')}
                  disabled={isChanging}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {isChanging ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Aprobar
                </Button>
                <Button
                  onClick={() => handleStatusChange('rechazado')}
                  disabled={isChanging}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {isChanging ? <Loader className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Rechazar
                </Button>
              </>
            )}

            {isAdmin && document.estado !== 'pendiente' && (
              <>
                <Button
                  onClick={() => {
                    setIsChanging(true)
                    if (onStatusChange) {
                      onStatusChange(document.id, 'pendiente').then(() => {
                        setIsChanging(false)
                        setTimeout(() => onClose(), 1000)
                      }).catch(err => {
                        console.error('[v0] Error reverting to pending:', err)
                        setIsChanging(false)
                      })
                    }
                  }}
                  disabled={isChanging}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isChanging ? <Loader className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                  Volver a Pendiente
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600/80 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Eliminar
                </Button>
              </>
            )}

            {isAdmin && document.estado === 'pendiente' && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600/80 hover:bg-red-700 text-white flex items-center gap-2"
              >
                {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </Button>
            )}
          </div>

          {/* Status Change Info */}
          {isAdmin && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-300">
              <p className="font-semibold mb-1">Permisos de Administrador</p>
              <p>Puedes cambiar el estado del documento usando los botones arriba. Los cambios se registran en el historial de auditoría.</p>
            </div>
          )}

          {!isAdmin && document.estado === 'pendiente' && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 text-sm text-yellow-300">
              <p className="font-semibold mb-1">En Revisión</p>
              <p>Este documento está siendo revisado por el equipo administrativo. Te notificaremos cuando sea aprobado o si requiere cambios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
