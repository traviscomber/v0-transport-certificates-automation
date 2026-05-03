'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader, Download, Eye, X, Clock, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface UploadedDocument {
  id: string
  document_type: string
  extracted_document_type: string | null
  file_name: string
  file_url: string
  validation_status: 'pending' | 'approved' | 'rejected'
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

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    type: 'licencia_conducir',
    label: 'Licencia de Conducir',
    description: 'Vigente, categoría mínima B'
  },
  {
    type: 'certificado_antecedentes',
    label: 'Certificado de Antecedentes',
    description: 'Emitido por Carabineros (no más de 6 meses)'
  },
  {
    type: 'poliza_seguro',
    label: 'Póliza de Seguro',
    description: 'Seguro obligatorio del vehículo'
  },
  {
    type: 'verificacion_tecnica',
    label: 'Verificación Técnica',
    description: 'VTV vigente del vehículo'
  }
]

export default function ConductorDocumentosPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [compliancePercentage, setCompliancePercentage] = useState(0)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    // Calculate compliance percentage
    const approved = documents.filter(d => d.validation_status === 'approved').length
    const percentage = Math.round((approved / REQUIRED_DOCUMENTS.length) * 100)
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
      formData.append('documentType', 'conductor_document')

      // Fetch uses Supabase cookies automatically (set during login)
      const response = await fetch('/api/conductor/upload-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al subir documento')
      }

      setSuccess('Documento subido exitosamente. Se validará en 24-48 horas.')
      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir documento')
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
    return documents.find(d => d.document_type === type)
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
            Arrastra y suelta o haz clic para seleccionar (PDF, JPG, PNG - Máximo 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
