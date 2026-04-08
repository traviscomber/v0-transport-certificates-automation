import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Upload, FileText, AlertCircle, CheckCircle2, Loader } from "lucide-react"
import { useState, useRef } from "react"

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

export default function DriverUploadPage() {
  const [selectedType, setSelectedType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('El archivo no debe superar 10MB')
        setFile(null)
        return
      }
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMessage('Solo se aceptan archivos PDF, JPG o PNG')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setErrorMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedType) {
      setErrorMessage('Selecciona un tipo de documento y un archivo')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', selectedType)

    try {
      const response = await fetch('/api/conductor/upload-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al subir documento')
      }

      setUploadStatus('success')
      setFile(null)
      setSelectedType('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Subir Documentos</h1>
          <p className="text-muted-foreground">Carga tus documentos para cumplimiento legal</p>
        </div>

        {/* Upload Card */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">Nuevo Documento</CardTitle>
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
                  disabled={uploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
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
            {file && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <FileText className="w-5 h-5 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === 'success' && (
              <div className="flex items-gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-300">Documento subido exitosamente. Será procesado en 2-4 horas.</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || !selectedType || uploading}
              className="w-full btn-orange"
            >
              {uploading ? (
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
