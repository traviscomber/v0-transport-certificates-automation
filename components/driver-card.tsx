import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, FileText, Download, ChevronDown, Plus, X, Upload, AlertCircle, Loader, Eye } from 'lucide-react'
import { useDriverDocuments } from '@/hooks/use-driver-documents'
import { DocumentActionModal } from './document-action-modal'
import { useDocumentManagement } from '@/hooks/use-document-management'

interface Driver {
  id: string
  rut: string
  nombre: string
  proveedor?: string
  patente_tracto?: string
  clase_licencia?: string
  is_active?: boolean
  rut_proveedor?: string
}

interface DriverCardProps {
  driver: Driver
  expandedDocuments: Set<string>
  toggleDocuments: (id: string) => void
  getDocumentStatusColor: (estado: string) => string
  getDocumentStatusLabel: (estado: string) => string
}

export function DriverCard({
  driver,
  expandedDocuments,
  toggleDocuments,
  getDocumentStatusColor,
  getDocumentStatusLabel,
}: DriverCardProps) {
  const { documents, loading, uploadDocument, refetch } = useDriverDocuments(driver.rut)
  const { changeStatus } = useDocumentManagement()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadDocType, setUploadDocType] = useState('Licencia de Conducir')
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleUpload = async () => {
    if (!uploadFileName.trim() || !uploadFile) {
      setUploadError('Por favor selecciona un archivo')
      return
    }

    setUploading(true)
    setUploadError('')
    try {
      console.log('[v0] Iniciando upload:', { driverId: driver.id, tipo: uploadDocType, nombre: uploadFileName, fileSize: uploadFile.size })
      await uploadDocument(uploadDocType, uploadFileName, uploadFile)
      setShowUploadModal(false)
      setUploadFileName('')
      setUploadFile(null)
      setUploadDocType('Licencia de Conducir')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al subir documento'
      console.error('[v0] Upload error:', errorMsg, error)
      setUploadError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const statusBg = driver.is_active
    ? 'bg-green-500/20'
    : 'bg-red-500/20'
  const statusText = driver.is_active ? 'text-green-200' : 'text-red-200'

  return (
    <>
      <Card className={`border-slate-700 hover:border-slate-600 transition-all ${statusBg}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header with RUT and status */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">RUT</p>
                <p className="font-mono text-lg font-bold text-amber-400">{driver.rut}</p>
              </div>
              <Badge className={`${statusText} bg-transparent border border-current`}>
                {driver.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Nombre */}
            <div>
              <p className="font-semibold text-white">{driver.nombre}</p>
            </div>

            {/* Proveedor */}
            {driver.proveedor && (
              <div className="text-sm">
                <p className="text-xs text-slate-400">PROVEEDOR</p>
                <p className="text-slate-200">{driver.proveedor}</p>
              </div>
            )}

            {/* Patente Tracto */}
            {driver.patente_tracto && (
              <div className="text-sm">
                <p className="text-xs text-slate-400">PATENTE TRACTO</p>
                <p className="font-mono text-blue-400">{driver.patente_tracto}</p>
              </div>
            )}

            {/* Clase de Licencia */}
            {driver.clase_licencia && (
              <div className="text-sm">
                <p className="text-xs text-slate-400">LICENCIA</p>
                <Badge className="bg-slate-700 text-slate-200">{driver.clase_licencia}</Badge>
              </div>
            )}

            {/* RUT Proveedor */}
            {driver.rut_proveedor && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold uppercase text-slate-400">RUT Proveedor</p>
                <p className="font-mono text-sm text-slate-400">{driver.rut_proveedor}</p>
              </div>
            )}

            {/* Documentos Subidos - Sección Expandible SIEMPRE VISIBLE */}
            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggleDocuments(driver.id)}
                  className="flex flex-1 items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">
                      Documentos ({documents.length})
                    </span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      expandedDocuments.has(driver.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {/* Botón de upload para LABBE */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="ml-2 p-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs text-white"
                  title="Subir documento"
                >
                  <Plus className="h-3 w-3" />
                  <span>Subir</span>
                </button>
              </div>

              {/* Documentos expandibles */}
              {expandedDocuments.has(driver.id) && (
                <div className="space-y-2">
                  {loading || refreshing ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="h-4 w-4 animate-spin text-slate-400" />
                      <span className="ml-2 text-xs text-slate-400">
                        {refreshing ? 'Actualizando...' : 'Cargando...'}
                      </span>
                    </div>
                  ) : documents.length > 0 ? (
                    <>
                      {/* Banner de documentos rechazados */}
                      {documents.some(d => d.estado === 'rechazado') && (
                        <div className="rounded bg-red-500/20 border border-red-500/50 p-3 text-xs text-red-300">
                          <p className="font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Documentos Rechazados
                          </p>
                          <p className="text-xs text-red-300/80 mt-1">
                            Por favor, vuelve a subir los documentos marcados como rechazados
                          </p>
                        </div>
                      )}
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between rounded bg-slate-800/50 p-2 text-xs hover:bg-slate-800 transition-colors cursor-pointer ${
                            doc.estado === 'rechazado' ? 'opacity-60' : ''
                          }`}
                          onClick={() => {
                            setSelectedDocument(doc)
                            setShowDocumentModal(true)
                          }}
                        >
                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <FileText className="h-3 w-3 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium truncate ${
                              doc.estado === 'rechazado' 
                                ? 'text-red-400 line-through' 
                                : 'text-slate-300'
                            }`}>
                              {doc.tipo}
                            </p>
                            <p className={`truncate text-xs ${
                              doc.estado === 'rechazado' 
                                ? 'text-red-500/70 line-through' 
                                : 'text-slate-500'
                            }`}>
                              {doc.nombre}
                            </p>
                            <p className={`text-xs ${
                              doc.estado === 'rechazado' 
                                ? 'text-red-600' 
                                : 'text-slate-600'
                            }`}>
                              {new Date(doc.fecha_subida).toLocaleDateString('es-ES')}
                              {doc.estado === 'rechazado' && ' - RECHAZADO'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge 
                            className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${getDocumentStatusColor(doc.estado)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocument(doc)
                              setShowDocumentModal(true)
                            }}
                          >
                            {getDocumentStatusLabel(doc.estado)}
                          </Badge>
                          <button 
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDocument(doc)
                              setShowDocumentModal(true)
                            }}
                          >
                            <Eye className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                        ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <p className="text-xs">No hay documentos subidos</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-lg font-semibold text-white">Subir Documento</h2>

            {/* Conductor Info */}
            <div className="mb-4 rounded bg-slate-800 p-3 text-sm">
              <p className="text-slate-400">Conductor:</p>
              <p className="font-semibold text-white">{driver.nombre}</p>
              <p className="text-xs text-slate-500">{driver.rut}</p>
            </div>

            <div className="space-y-4">
              {/* Tipo de Documento */}
              <div>
                <label className="text-sm font-semibold text-slate-300">Tipo de Documento</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="mt-2 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  <option>Licencia de Conducir</option>
                  <option>Antecedentes Penales</option>
                  <option>Certificado Médico</option>
                  <option>Comprobante Domicilio</option>
                  <option>Contrato</option>
                  <option>Otro</option>
                </select>
              </div>

              {/* Nombre del archivo */}
              <div>
                <label className="text-sm font-semibold text-slate-300">Nombre del Archivo</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="ej: Licencia_2024.pdf"
                  className="mt-2 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
                />
              </div>

              {/* File Upload Area */}
              <div 
                className="rounded border-2 border-dashed border-slate-700 p-4 text-center cursor-pointer hover:border-slate-500 hover:bg-slate-800/30 transition-all"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10')
                  if (e.dataTransfer.files?.[0]) {
                    const file = e.dataTransfer.files[0]
                    setUploadFileName(file.name)
                    setUploadFile(file)
                  }
                }}
                onClick={() => {
                  const input = document.getElementById(`file-input-${driver.rut}`) as HTMLInputElement
                  input?.click()
                }}
              >
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Arrastra aquí o haz click para seleccionar archivo</p>
                <input
                  id={`file-input-${driver.rut}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0]
                      setUploadFileName(file.name)
                      setUploadFile(file)
                    }
                  }}
                />
              </div>

              {/* Error Alert */}
              {uploadError && (
                <div className="rounded bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-300">
                  <p className="font-semibold">Error:</p>
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="flex-1 rounded border border-slate-700 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFileName.trim() || uploading}
                  className="flex-1 rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading && <Loader className="h-4 w-4 animate-spin" />}
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Action Modal */}
      <DocumentActionModal
        document={selectedDocument}
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false)
          setSelectedDocument(null)
        }}
        onStatusChange={async (docId, newStatus) => {
          try {
            await changeStatus(docId, newStatus, 'Cambio realizado desde dashboard')
            console.log('[v0] Status changed, refreshing documents...')
            setRefreshing(true)
            await refetch()
            setRefreshing(false)
            setTimeout(() => {
              setShowDocumentModal(false)
              setSelectedDocument(null)
            }, 500)
          } catch (error) {
            console.error('[v0] Error updating status:', error)
            throw error
          }
        }}
        onDelete={async (docId) => {
          console.log('[v0] Document deleted, refreshing...')
          setRefreshing(true)
          await refetch()
          setRefreshing(false)
        }}
        isAdmin={true}
      />
    </>
  )
}
