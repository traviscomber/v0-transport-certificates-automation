'use client'

import { X, FileText, Award, AlertCircle, CheckCircle, Loader, Download, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentManagementModal } from './document-management-modal'

interface SubcontractorDetailCardProps {
  subcontractor: any
  onClose: () => void
}

export function SubcontractorDetailCard({
  subcontractor,
  onClose,
}: SubcontractorDetailCardProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDocumentManagement, setShowDocumentManagement] = useState(false)
  const [summary, setSummary] = useState({
    totalDocumentsUploaded: 0,
    totalRequirements: 0,
    approvedDocuments: 0,
    pendingDocuments: 0,
    expiredDocuments: 0,
  })

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/subcontractors/${subcontractor.id}/documents`)
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents || [])
          setRequirements(data.requirements || [])
          setSummary(data.summary || summary)
        }
      } catch (error) {
        console.error('[v0] Error fetching documents:', error)
      } finally {
        setLoading(false)
      }
    }

    if (subcontractor.id) {
      fetchDocuments()
    }
  }, [subcontractor.id])

  const handleDocumentsUpdated = async () => {
    // Refetch documents after upload/delete
    const response = await fetch(`/api/subcontractors/${subcontractor.id}/documents`)
    if (response.ok) {
      const data = await response.json()
      setDocuments(data.documents || [])
      setRequirements(data.requirements || [])
      setSummary(data.summary || summary)
    }
  }
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-start justify-between border-b border-slate-700 sticky top-0 bg-slate-900">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl text-white">
                {subcontractor.nombre}
              </CardTitle>
              {subcontractor.nombre_fantasia && (
                <p className="text-sm text-slate-400 italic">
                  {subcontractor.nombre_fantasia}
                </p>
              )}
              <div className="flex gap-2 items-center">
                {subcontractor.is_active ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Badge className="bg-green-500/20 text-green-300">Activo</Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <Badge className="bg-red-500/20 text-red-300">Inactivo</Badge>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Company Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">RUT</p>
                <p className="font-mono text-amber-400 font-bold">{subcontractor.rut}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">COMUNA</p>
                <p className="text-white">{subcontractor.comuna || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-semibold mb-1">DIRECCIÓN</p>
                <p className="text-white">{subcontractor.direccion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  REPRESENTANTE LEGAL
                </p>
                <p className="text-white">{subcontractor.representante_legal || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  EJECUTIVA ASIGNADA
                </p>
                <p className="text-white">{subcontractor.ejecutivo_nombre || 'Sin asignar'}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                Información de Contacto
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">TELÉFONO</p>
                  {subcontractor.telefono ? (
                    <a
                      href={`tel:${subcontractor.telefono}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {subcontractor.telefono}
                    </a>
                  ) : (
                    <p className="text-slate-500">No disponible</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">EMAIL</p>
                  {subcontractor.email || subcontractor.correo ? (
                    <a
                      href={`mailto:${subcontractor.email || subcontractor.correo}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      {subcontractor.email || subcontractor.correo}
                    </a>
                  ) : (
                    <p className="text-slate-500">No disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications Note - Now in Document Management */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificaciones
              </h3>
              <div className="p-3 bg-blue-900/20 border border-blue-800 rounded text-xs text-blue-300">
                <p className="font-semibold mb-1">Certificaciones gestionadas como documentos</p>
                <p className="text-blue-400/80">Las 4 certificaciones (Ariztia, LTS, Rendic, Interpolar) se encuentran en la sección &quot;Carpeta de Documentos&quot; donde puedes subirlas, descargarlas y hacer seguimiento de su estado.</p>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Carpeta de Documentos
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-4 h-4 animate-spin text-slate-400 mr-2" />
                  <span className="text-sm text-slate-400">Cargando documentos...</span>
                </div>
              ) : (
                <>
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="p-2 rounded bg-slate-800 text-center">
                      <p className="text-lg font-bold text-white">{summary.totalRequirements}</p>
                      <p className="text-xs text-slate-400">Requeridos</p>
                    </div>
                    <div className="p-2 rounded bg-blue-900/20 border border-blue-800 text-center">
                      <p className="text-lg font-bold text-blue-300">{summary.totalDocumentsUploaded}</p>
                      <p className="text-xs text-blue-400">Subidos</p>
                    </div>
                    <div className="p-2 rounded bg-green-900/20 border border-green-800 text-center">
                      <p className="text-lg font-bold text-green-300">{summary.approvedDocuments}</p>
                      <p className="text-xs text-green-400">Aprobados</p>
                    </div>
                    <div className="p-2 rounded bg-yellow-900/20 border border-yellow-800 text-center">
                      <p className="text-lg font-bold text-yellow-300">{summary.pendingDocuments}</p>
                      <p className="text-xs text-yellow-400">Pendientes</p>
                    </div>
                    <div className="p-2 rounded bg-red-900/20 border border-red-800 text-center">
                      <p className="text-lg font-bold text-red-300">{summary.expiredDocuments}</p>
                      <p className="text-xs text-red-400">Vencidos</p>
                    </div>
                  </div>

                  {/* Requirements List */}
                  {requirements.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-400">Documentos Requeridos</p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {requirements.map((req) => {
                          const statusColors: Record<string, string> = {
                            aprobado: 'bg-green-900/20 border-green-800 text-green-400',
                            pendiente: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
                            rechazado: 'bg-red-900/20 border-red-800 text-red-400',
                            vencido: 'bg-orange-900/20 border-orange-800 text-orange-400',
                            no_subido: 'bg-slate-800 text-slate-400',
                          }
                          const statusColor = statusColors[req.status] || statusColors.no_subido
                          const statusLabel: Record<string, string> = {
                            aprobado: 'Aprobado',
                            pendiente: 'Pendiente',
                            rechazado: 'Rechazado',
                            vencido: 'Vencido',
                            no_subido: 'No subido',
                          }
                          
                          // Find uploaded document for this requirement
                          const uploadedDoc = documents.find((d) => d.nombre.includes(req.code))
                          
                          return (
                            <div
                              key={req.id}
                              className={`p-2 rounded border text-xs flex items-center justify-between ${statusColor}`}
                            >
                              <span className="font-mono">{req.code}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-right">{statusLabel[req.status]}</span>
                                {uploadedDoc && uploadedDoc.archivo_url && (
                                  <div className="flex gap-1">
                                    <a
                                      href={`/api/documents/download?path=${encodeURIComponent(uploadedDoc.archivo_url)}`}
                                      download
                                      className="hover:opacity-75 transition-opacity"
                                      title="Descargar"
                                    >
                                      <Download className="w-3 h-3" />
                                    </a>
                                    <a
                                      href={`/api/documents/preview?path=${encodeURIComponent(uploadedDoc.archivo_url)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-75 transition-opacity"
                                      title="Ver"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload Documents Button */}
                  <button 
                    onClick={() => setShowDocumentManagement(true)}
                    className="w-full px-4 py-2 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors text-sm border border-orange-500/30 font-semibold"
                  >
                    Gestionar Documentos
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Management Modal */}
      {showDocumentManagement && (
        <DocumentManagementModal
          subcontractorId={subcontractor.id}
          subcontractorName={subcontractor.nombre}
          requirements={requirements}
          uploadedDocuments={documents}
          onClose={() => setShowDocumentManagement(false)}
          onDocumentsUpdated={handleDocumentsUpdated}
        />
      )}
    </>
  )
}
