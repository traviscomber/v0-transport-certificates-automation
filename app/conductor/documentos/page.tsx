'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader, Download, Eye, X, Clock } from 'lucide-react'
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
      const response = await fetch('/api/conductor/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')
      
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Error al cargar documentos')
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
      const token = localStorage.getItem('conductor_token')
      if (!token) throw new Error('No authentication token found')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'conductor_document')

      const response = await fetch('/api/conductor/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        return <Badge variant="destructive">Vencido</Badge>
      } else if (daysUntilExpiry < 7) {
        return <Badge className="bg-orange-100 text-orange-800">Vence en {daysUntilExpiry} días</Badge>
      }
    }

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="secondary">En Revisión</Badge>
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
    <div className="space-y-6">
      {/* Header with Compliance */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Documentos</h1>
          <p className="text-muted-foreground">
            Sube y gestiona tus documentos requeridos para trabajar con Labbe
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Cumplimiento</p>
          <p className="text-3xl font-bold text-blue-600">{compliancePercentage}%</p>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Documento</CardTitle>
          <CardDescription>
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
                ? 'bg-blue-50 border-blue-400'
                : 'bg-muted/50 hover:bg-muted/80 border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`h-10 w-10 mb-2 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="mb-2 text-sm font-semibold">
                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic'}
              </p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
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
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm">Subiendo documento...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Required Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Requeridos</CardTitle>
          <CardDescription>
            Estado de cada documento requerido para tu aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((reqDoc) => {
                const uploadedDoc = getDocumentByType(reqDoc.type)
                return (
                  <div
                    key={reqDoc.type}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {uploadedDoc ? (
                          getStatusIcon(uploadedDoc.validation_status)
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{reqDoc.label}</p>
                        <p className="text-sm text-gray-600">{reqDoc.description}</p>
                        {uploadedDoc?.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">
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
                            asChild
                          >
                            <a href={uploadedDoc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline">No subido</Badge>
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
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">¿Necesitas ayuda?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>• Los documentos se validan en 24-48 horas</p>
          <p>• Recibirás notificaciones por email y WhatsApp</p>
          <p>• Puedes subir nuevas versiones si un documento es rechazado</p>
          <p>• Contacta con soporte@labbe.cl si tienes preguntas</p>
        </CardContent>
      </Card>
    </div>
  )
}
