'use client'

import { useState, useEffect } from 'react'
import { X, Download, Eye, CheckCircle, XCircle, Clock, Loader, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  onStatusChange?: (documentId: string, newStatus: 'pendiente' | 'aprobado' | 'rechazado', reason?: string) => Promise<void>
  onDelete?: (documentId: string) => Promise<void>
  onSetRejectionReason?: (reason: string) => void
  isAdmin?: boolean
}

export function DocumentActionModal({
  document,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  onSetRejectionReason,
  isAdmin = false,
}: DocumentActionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'aprobado' | 'rechazado' | 'pendiente' | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [localDocument, setLocalDocument] = useState<Document | null>(document)
  const { deleteDocument } = useDocumentManagement()

  // Update local document when prop changes
  useEffect(() => {
    setLocalDocument(document)
  }, [document])

  // Reset rejection reason when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRejectionReason('')
      setShowRejectionForm(false)
    }
  }, [isOpen])

  if (!isOpen || !localDocument) return null

  const handleStatusChange = async (newStatus: 'aprobado' | 'rechazado' | 'pendiente') => {
    // Require rejection reason if rejecting
    if (newStatus === 'rechazado' && !rejectionReason.trim()) {
      alert('Debes especificar la razón del rechazo')
      return
    }

    console.log('[v0] handleStatusChange - About to send:', { newStatus, rejectionReason, reasonLength: rejectionReason.length })

    setIsChanging(true)
    try {
      // Pass rejection reason to parent component if available
      if (onSetRejectionReason && newStatus === 'rechazado') {
        onSetRejectionReason(rejectionReason)
      }
      
      // Call the onStatusChange callback with reason passed directly
      if (onStatusChange) {
        await onStatusChange(localDocument.id, newStatus, newStatus === 'rechazado' ? rejectionReason : undefined)
      }
      
      // Update local document state immediately to reflect the change in the modal
      if (localDocument) {
        setLocalDocument({
          ...localDocument,
          estado: newStatus
        })
      }
      
      console.log('[v0] Document status changed to:', newStatus, 'with reason:', rejectionReason)
      setRejectionReason('')
      setShowRejectionForm(false)
      setTimeout(() => onClose(), 500)
    } catch (error) {
      console.error('[v0] Error changing status:', error)
      alert('Error al cambiar el estado del documento')
    } finally {
      setIsChanging(false)
    }
  }

  const handleDownload = () => {
    if (localDocument.public_url) {
      window.open(localDocument.public_url, '_blank')
    } else if (localDocument.storage_path) {
      // Fallback if public_url not available
      alert('El documento no tiene URL pública disponible. Storage path: ' + localDocument.storage_path)
    } else {
      alert('No hay URL disponible para descargar')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/company/documents/${localDocument.id}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el documento')
      }

      if (onDelete) {
        await onDelete(localDocument.id)
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
            <h2 className="text-2xl font-bold text-white mb-2">{localDocument.tipo}</h2>
            <p className="text-slate-400 text-sm mb-4">{localDocument.nombre}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm">
                <p className="text-slate-500">Fecha de carga</p>
                <p className="text-white">{new Date(localDocument.fecha_subida).toLocaleDateString('es-ES')}</p>
              </div>
              <div className="text-sm">
                <p className="text-slate-500">Estado actual</p>
                <div className={`font-semibold ${getStatusColor(localDocument.estado)}`}>
                  {getStatusLabel(localDocument.estado)}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && localDocument.public_url && (
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
                    URL: {localDocument.public_url?.substring(0, 50)}...
                  </div>
                )}
                
                {/* Image Preview */}
                {localDocument.public_url ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <img
                      src={localDocument.public_url}
                      alt={localDocument.nombre}
                      className="max-w-full max-h-96 object-contain rounded"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('[v0] Image failed to load:', localDocument.public_url)
                        e.currentTarget.style.display = 'none'
                        const errorMsg = e.currentTarget.nextElementSibling as HTMLElement
                        if (errorMsg) errorMsg.style.display = 'block'
                      }}
                      onLoad={() => {
                        console.log('[v0] Image loaded successfully:', localDocument.public_url)
                      }}
                    />
                    <div className="hidden text-center py-8 w-full">
                      <Eye className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">No se pudo cargar la vista previa</p>
                      <p className="text-slate-500 text-sm mt-1">{localDocument.nombre}</p>
                      <p className="text-slate-600 text-xs mt-2 break-all">{localDocument.public_url}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 w-full">
                    <Eye className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">URL no disponible</p>
                    <p className="text-slate-500 text-sm mt-1">{localDocument.nombre}</p>
                    <p className="text-slate-600 text-xs mt-2">Storage Path: {localDocument.storage_path}</p>
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
              disabled={!localDocument.public_url && !localDocument.storage_path}
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>

            {isAdmin && localDocument.estado === 'pendiente' && (
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
                  onClick={() => setShowRejectionForm(true)}
                  disabled={isChanging}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {isChanging ? <Loader className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Rechazar
                </Button>
              </>
            )}

            {isAdmin && localDocument.estado !== 'pendiente' && (
              <>
                <Button
                  onClick={() => handleStatusChange('pendiente')}
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

            {isAdmin && localDocument.estado === 'pendiente' && (
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

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-red-300 mb-2">
                  Razón del Rechazo <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Especifica por qué se rechaza este documento (ej: Imagen borrosa, datos incompletos, documento expirado)"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-red-500/50 text-white placeholder-slate-500 rounded text-sm"
                  rows={3}
                  autoFocus
                />
                {!rejectionReason.trim() && (
                  <p className="text-xs text-red-400 mt-1">Este campo es obligatorio</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusChange('rechazado')}
                  disabled={!rejectionReason.trim() || isChanging}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 flex-1"
                >
                  {isChanging ? <Loader className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Confirmar Rechazo
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectionForm(false)
                    setRejectionReason('')
                  }}
                  variant="outline"
                  disabled={isChanging}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Status Change Info */}
          {isAdmin && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-300">
              <p className="font-semibold mb-1">Permisos de Administrador</p>
              <p>Puedes cambiar el estado del documento usando los botones arriba. Los cambios se registran en el historial de auditoría.</p>
            </div>
          )}

          {!isAdmin && localDocument.estado === 'pendiente' && (
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
