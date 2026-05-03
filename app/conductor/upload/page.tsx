"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Upload, FileText, AlertCircle, CheckCircle2, Loader } from "lucide-react"
import { useState, useRef } from "react"

const ALLOWED_DOCUMENT_TYPES = [
  { id: 'CEDULA_IDENTIDAD', label: 'Cédula de Identidad', code: 'CEDULA_IDENTIDAD' },
  { id: 'LIC_CONDUCIR', label: 'Licencia de Conducir Profesional', code: 'LIC_CONDUCIR' },
  { id: 'HOJA_VIDA', label: 'Hoja de Vida', code: 'HOJA_VIDA' },
  { id: 'CERT_ANTECEDENTES', label: 'Certificado de Antecedentes', code: 'CERT_ANTECEDENTES' },
  { id: 'INHABILIDADES_MENORES', label: 'Inhabilidades Menores', code: 'INHABILIDADES_MENORES' },
  { id: 'CONTRATO_TRABAJO', label: 'Contrato de Trabajo', code: 'CONTRATO_TRABAJO' },
  { id: 'CERT_AFP', label: 'Certificado AFP', code: 'CERT_AFP' },
  { id: 'REVISION_TECNICA', label: 'Revisión Técnica', code: 'REVISION_TECNICA' },
  { id: 'SOAP', label: 'Seguro Obligatorio (SOAP)', code: 'SOAP' },
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
    const selectedDoc = ALLOWED_DOCUMENT_TYPES.find(t => t.id === selectedType)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', selectedDoc?.code || selectedType)

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
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-700 pb-6">
          <h1 className="text-5xl font-bold text-white">Subir Documentos</h1>
          <p className="text-slate-300">Carga tus documentos para cumplimiento legal</p>
        </div>

        {/* Upload Card */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Nuevo Documento</CardTitle>
            <CardDescription className="text-slate-300">
              Selecciona el tipo de documento y carga el archivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="docType" className="text-white">Tipo de Documento *</Label>
              <select
                id="docType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="" className="bg-slate-800 text-white">Selecciona un tipo de documento</option>
                {ALLOWED_DOCUMENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id} className="bg-slate-800 text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-white">Archivo *</Label>
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
                  <Upload className="w-8 h-8 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">Selecciona archivo</p>
                    <p className="text-sm text-slate-300">o arrastra aquí</p>
                  </div>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                PDF, JPG o PNG • Máximo 10MB
              </p>
            </div>

            {/* File Preview */}
            {file && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <FileText className="w-5 h-5 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
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
            <CardTitle className="text-white">Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p>• Los documentos se validarán automáticamente con IA en 2-4 horas</p>
            <p>• Recibirás notificaciones por correo y WhatsApp cuando se apruebe/rechace</p>
            <p>• Asegúrate de que los documentos sean legibles y en formato correcto</p>
            <p>• Para problemas, contacta: soporte@labbe.cl</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
