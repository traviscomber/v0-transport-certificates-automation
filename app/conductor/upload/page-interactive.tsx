'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertCircle, CheckCircle2, Loader, X } from "lucide-react"

const ALLOWED_DOCUMENT_TYPES = [
  { id: 'CEDULA_IDENTIDAD', label: 'Cédula de Identidad' },
  { id: 'LICENCIA_CONDUCIR', label: 'Licencia de Conducir Profesional' },
  { id: 'HOJA_VIDA_CONDUCTOR', label: 'Hoja de Vida' },
  { id: 'CERTIFICADO_ANTECEDENTES', label: 'Certificado de Antecedentes' },
  { id: 'INHABILIDADES_MENORES', label: 'Inhabilidades Menores' },
  { id: 'CONTRATO_TRABAJO', label: 'Contrato de Trabajo' },
  { id: 'CERTIFICADO_AFP', label: 'Certificado AFP' },
  { id: 'CERTIFICADO_SALUD', label: 'Certificado de Salud' },
  { id: 'EXAMEN_PREOCUPACIONAL', label: 'Examen Preocupacional' },
]

interface UploadState {
  file: File | null
  selectedType: string
  uploading: boolean
  uploadStatus: 'idle' | 'success' | 'error'
  errorMessage: string
  uploadedDocuments: any[]
  loadingDocuments: boolean
}

export default function DriverUploadPage() {
  const [state, setState] = useState<UploadState>({
    file: null,
    selectedType: '',
    uploading: false,
    uploadStatus: 'idle',
    errorMessage: '',
    uploadedDocuments: [],
    loadingDocuments: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/conductor/documents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setState(prev => ({
          ...prev,
          uploadedDocuments: data.documents || [],
          loadingDocuments: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          loadingDocuments: false,
        }))
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      setState(prev => ({
        ...prev,
        loadingDocuments: false,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > 10 * 1024 * 1024) {
        setState(prev => ({
          ...prev,
          errorMessage: 'El archivo no debe superar 10MB',
          file: null,
        }))
        return
      }

      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(selectedFile.type)) {
        setState(prev => ({
          ...prev,
          errorMessage: 'Solo se aceptan archivos PDF, JPG o PNG',
          file: null,
        }))
        return
      }

      setState(prev => ({
        ...prev,
        file: selectedFile,
        errorMessage: '',
      }))
    }
  }

  const handleUpload = async () => {
    if (!state.file || !state.selectedType) {
      setState(prev => ({
        ...prev,
        errorMessage: 'Selecciona un tipo de documento y un archivo',
      }))
      return
    }

    setState(prev => ({ ...prev, uploading: true }))

    const formData = new FormData()
    formData.append('file', state.file)
    formData.append('documentType', state.selectedType)

    try {
      const response = await fetch('/api/conductor/upload-document', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al subir documento')
      }

      setState(prev => ({
        ...prev,
        uploadStatus: 'success',
        file: null,
        selectedType: '',
        errorMessage: '',
        uploading: false,
      }))

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reload documents after a short delay
      setTimeout(loadDocuments, 1000)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          uploadStatus: 'idle',
        }))
      }, 5000)
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploadStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        uploading: false,
      }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="inline-flex items-center gap-1 text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          Vigente
        </span>
      case 'expired':
        return <span className="inline-flex items-center gap-1 text-red-400">
          <AlertCircle className="w-4 h-4" />
          Vencido
        </span>
      case 'expiring-soon':
        return <span className="inline-flex items-center gap-1 text-orange-400">
          <AlertCircle className="w-4 h-4" />
          Por Vencer
        </span>
      default:
        return <span className="inline-flex items-center gap-1 text-blue-400">
          <Loader className="w-4 h-4 animate-spin" />
          En Proceso
        </span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Carga y gestiona tus documentos de cumplimiento legal</p>
        </div>

        {/* Upload Card */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">Cargar Nuevo Documento</CardTitle>
            <CardDescription className="text-muted-foreground">
              Selecciona el tipo de documento y carga el archivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="docType" className="text-foreground">Tipo de Documento *</Label>
              <select
                id="docType"
                value={state.selectedType}
                onChange={(e) => setState(prev => ({ ...prev, selectedType: e.target.value }))}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">Selecciona un tipo de documento</option>
                {ALLOWED_DOCUMENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-foreground">Archivo *</Label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={state.uploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.uploading}
                  className="w-full border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2 bg-slate-800/50"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Selecciona archivo</p>
                    <p className="text-sm text-muted-foreground">o arrastra aquí</p>
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, JPG o PNG • Máximo 10MB
              </p>
            </div>

            {/* File Preview */}
            {state.file && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <FileText className="w-5 h-5 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{state.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {state.errorMessage && (
              <div className="flex items-gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{state.errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {state.uploadStatus === 'success' && (
              <div className="flex items-gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-300">Documento subido exitosamente. Será procesado en 2-4 horas.</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!state.file || !state.selectedType || state.uploading}
              className="w-full btn-orange"
            >
              {state.uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Documents List */}
        {!state.loadingDocuments && state.uploadedDocuments.length > 0 && (
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="text-foreground">Mis Documentos</CardTitle>
              <CardDescription className="text-muted-foreground">
                {state.uploadedDocuments.length} documento(s) cargado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {doc.documentType?.name || 'Documento'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(doc.created_at).toLocaleDateString('es-CL')}
                        {doc.expiry_date && ` • Vence: ${new Date(doc.expiry_date).toLocaleDateString('es-CL')}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.daysRemaining !== null && (
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {doc.daysRemaining < 0 
                              ? `Vencido hace ${Math.abs(doc.daysRemaining)} días`
                              : `${doc.daysRemaining} días`
                            }
                          </p>
                        </div>
                      )}
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Los documentos se procesan automáticamente mediante OCR (Reconocimiento Óptico de Caracteres)
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                La validación manual ocurre en 2-4 horas. Recibirás notificación por email
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Asegúrate que el documento sea legible y contenga toda la información requerida
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Los documentos se almacenan de forma segura según regulaciones chilenas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
