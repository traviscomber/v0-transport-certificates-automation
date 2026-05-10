'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader, Download, Eye, X, Clock, HelpCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useDocumentSync } from '@/contexts/document-sync-context'

interface UploadedDocument {
  id: string
  document_type: string
  document_type_id?: string
  document_type_code?: string
  document_type_name?: string
  extracted_document_type: string | null
  file_name: string
  file_url: string
  validation_status: 'pending' | 'approved' | 'validated' | 'rejected' | 'expired'
  extraction_confidence: number | null
  created_at: string
  expiration_date?: string
  rejection_reason?: string
}

interface RequiredDocument {
  type: string
  label: string
  description: string
  uploaded?: UploadedDocument
}

const DOCUMENT_TYPES = [
  { id: 'LIC_CONDUCIR', label: 'Licencia de Conducir', code: 'LIC_CONDUCIR' },
  { id: 'HOJA_VIDA', label: 'Hoja de Vida', code: 'HOJA_VIDA' },
  { id: 'CERT_ANTECEDENTES', label: 'Certificado de Antecedentes', code: 'CERT_ANTECEDENTES' },
  { id: 'CEDULA_IDENTIDAD', label: 'Cédula de Identidad', code: 'CEDULA_IDENTIDAD' },
  { id: 'INHABILIDADES_MENORES', label: 'Inhabilidades Menores', code: 'INHABILIDADES_MENORES' },
  { id: 'CONTRATO_TRABAJO', label: 'Contrato de Trabajo', code: 'CONTRATO_TRABAJO' },
  { id: 'CERT_AFP', label: 'Certificado AFP', code: 'CERT_AFP' },
  { id: 'REVISION_TECNICA', label: 'Revisión Técnica', code: 'REVISION_TECNICA' },
  { id: 'SOAP', label: 'Seguro Obligatorio (SOAP)', code: 'SOAP' },
]

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    type: 'LIC_CONDUCIR',
    label: 'Licencia de Conducir',
    description: 'Vigente, categoría mínima B'
  },
  {
    type: 'CERT_ANTECEDENTES',
    label: 'Certificado de Antecedentes',
    description: 'Emitido por Carabineros (no más de 6 meses)'
  },
  {
    type: 'HOJA_VIDA',
    label: 'Hoja de Vida',
    description: 'Hoja de vida del conductor'
  },
  {
    type: 'CEDULA_IDENTIDAD',
    label: 'Cédula de Identidad',
    description: 'Vigente y legible'
  },
  {
    type: 'INHABILIDADES_MENORES',
    label: 'Inhabilidades Menores',
    description: 'Registro de inhabilidades para trabajar con menores'
  },
  {
    type: 'CONTRATO_TRABAJO',
    label: 'Contrato de Trabajo',
    description: 'Contrato vigente'
  },
  {
    type: 'CERT_AFP',
    label: 'Certificado AFP',
    description: 'Cotizaciones previsionales al día'
  },
  {
    type: 'REVISION_TECNICA',
    label: 'Revisión Técnica',
    description: 'VTV vigente del vehículo'
  },
  {
    type: 'SOAP',
    label: 'Seguro Obligatorio (SOAP)',
    description: 'Seguro obligatorio del vehículo vigente'
  }
]

export default function ConductorDocumentosPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [conductorId, setConductorId] = useState<string>('')
  const { broadcastSync } = useDocumentSync()
  const [compliancePercentage, setCompliancePercentage] = useState(0)
  const [selectedDocumentType, setSelectedDocumentType] = useState('LIC_CONDUCIR')

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    // Calculate compliance percentage based on required docs that are approved
    const approvedCount = REQUIRED_DOCUMENTS.filter(reqDoc => {
      const uploaded = documents.find(d => 
        d.document_type_id === reqDoc.type || d.document_type === reqDoc.type
      )
      return uploaded && (uploaded.validation_status === 'approved' || uploaded.validation_status === 'validated')
    }).length
    const percentage = Math.round((approvedCount / REQUIRED_DOCUMENTS.length) * 100)
    setCompliancePercentage(percentage)
  }, [documents])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetch('/api/conductor/documents')
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents)
      } else {
        setDocuments([])
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('No se pudieron cargar los documentos. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      // Use selected document type
      formData.append('documentType', selectedDocumentType)

      // Fetch uses Supabase cookies automatically (set during login)
      const response = await fetch('/api/conductor/upload-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Error al subir documento')
      }

      const result = await response.json()
      setSuccess('Documento subido exitosamente. Se validará en 24-48 horas.')
      
      // Broadcast sync event so dashboard and other components update
      if (result.syncEvent) {
        console.log('[v0] Conductor page: Broadcasting upload sync event')
        broadcastSync({
          type: 'document_uploaded',
          conductorId: result.syncEvent.conductorId || conductorId,
          documentId: result.syncEvent.documentId || result.documentId,
          timestamp: result.syncEvent.timestamp || Date.now(),
          data: { file: file.name, validationStatus: result.validationStatus }
        })
      }
      
      await fetchDocuments()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir documento'
      setError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`¿Seguro que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setIsUploading(true)
      const response = await fetch(`/api/conductor/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al eliminar documento')
      }

      setSuccess('Documento eliminado exitosamente.')
      await fetchDocuments()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar documento'
      setError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const getStatusBadge = (status: string, expirationDate?: string) => {
    if (expirationDate) {
      const expDate = new Date(expirationDate)
      const daysUntilExpiry = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        return <Badge className="bg-red-900/30 text-red-300 border border-red-900/50">Vencido</Badge>
      } else if (daysUntilExpiry < 7) {
        return <Badge className="bg-orange-900/30 text-orange-300 border border-orange-900/50">Vence en {daysUntilExpiry} días</Badge>
      }
    }

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-900/30 text-green-300 border border-green-900/50">Aprobado</Badge>
      case 'rejected':
        return <Badge className="bg-red-900/30 text-red-300 border border-red-900/50">Rechazado</Badge>
      default:
        return <Badge className="bg-slate-700/50 text-slate-300 border border-slate-600">En Revisión</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
    }
  }

  const getDocumentByType = (type: string) => {
    // Match on document_type_id (e.g. 'LIC_CONDUCIR') or document_type name
    return documents.find(d => 
      d.document_type_id === type || 
      d.document_type === type ||
      (d.document_type_id && d.document_type_id.toUpperCase() === type.toUpperCase())
    )
  }

  return (
      <div className="space-y-8">
        {/* Header with Compliance */}
        <div className="flex justify-between items-start border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-5xl font-bold text-white">Mis Documentos</h1>
            <p className="text-slate-300 mt-2">Sube y gestiona tus documentos requeridos para trabajar con Labbe</p>
          </div>
          <div className="text-right bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-max">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Cumplimiento</p>
            <p className="text-4xl font-bold text-orange-500 mt-1">{compliancePercentage}%</p>
            <div className="w-32 bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${compliancePercentage}%` }}
              />
            </div>
          </div>
        </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-950/30 border-red-900/50">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-950/30 border-green-900/50">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card className="border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-800/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Subir Documento</CardTitle>
          <CardDescription className="text-slate-400">
            Selecciona el tipo de documento y arrastra o haz clic para seleccionar (PDF, JPG, PNG - Máximo 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Documento
            </label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            >
              {DOCUMENT_TYPES.map((doc) => (
                <option key={doc.id} value={doc.code}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? 'bg-orange-500/10 border-orange-500/50'
                : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`h-10 w-10 mb-2 ${isDragging ? 'text-orange-400' : 'text-slate-500'}`} />
              <p className="mb-2 text-sm font-semibold text-slate-300">
                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic'}
              </p>
              <p className="text-xs text-slate-500">PDF, JPG, PNG</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleInputChange}
              disabled={isUploading}
            />
          </label>
          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader className="h-4 w-4 animate-spin text-orange-500" />
              <span className="text-sm text-slate-300">Subiendo documento...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Required */}
      <Card className="border-slate-700 bg-slate-800/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Documentos Requeridos</CardTitle>
          <CardDescription className="text-slate-400">
            Estado de cada documento requerido para tu aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((reqDoc) => {
                const uploadedDoc = getDocumentByType(reqDoc.type)
                return (
                  <div
                    key={reqDoc.type}
                    className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 bg-slate-800/20 transition-all"
                  >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {uploadedDoc ? (
                        getStatusIcon(uploadedDoc.validation_status)
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{reqDoc.label}</p>
                      <p className="text-sm text-slate-300">{reqDoc.description}</p>
                        {uploadedDoc?.rejection_reason && (
                          <p className="text-sm text-red-400 mt-1">
                            Razón del rechazo: {uploadedDoc.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {uploadedDoc ? (
                        <>
                          {getStatusBadge(uploadedDoc.validation_status, uploadedDoc.expiration_date)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            asChild
                          >
                            <a href={uploadedDoc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => handleDeleteDocument(uploadedDoc.id, uploadedDoc.file_name || 'Documento')}
                            disabled={isUploading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="border-slate-600 text-slate-400">No subido</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-orange-950/40 to-orange-900/30 border-orange-900/50">
        <CardHeader>
          <CardTitle className="text-orange-300 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            ¿Necesitas ayuda?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-100 text-sm space-y-2">
          <p>• Los documentos se validan en 24-48 horas</p>
          <p>• Recibirás notificaciones por email y WhatsApp</p>
          <p>• Puedes subir nuevas versiones si un documento es rechazado</p>
          <p>• Contacta con soporte@labbe.cl si tienes preguntas</p>
        </CardContent>
      </Card>
    </div>
  )
}
