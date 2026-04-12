'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle, AlertCircle, Clock, X, File } from 'lucide-react'
import { type UploadedDocument } from '@/lib/data/document-upload-types'

interface DocumentUploadProps {
  entityType?: 'conductor' | 'subcontratista' | 'vehiculo'
  entityId?: string
  entityName?: string
}

export function DocumentUpload({ entityType = 'conductor', entityId = '', entityName = 'Usuario' }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const documentTypes = {
    conductor: [
      { id: 'licencia', label: 'Licencia de conducir' },
      { id: 'certificado_antecedentes', label: 'Certificado de antecedentes' },
      { id: 'examen_psicosensitivo', label: 'Examen psicosensitivo' },
      { id: 'certificado_afp', label: 'Certificado AFP' },
    ],
    subcontratista: [
      { id: 'revision_tecnica', label: 'Revisión técnica' },
      { id: 'seguro', label: 'Seguro integral' },
      { id: 'certificado_ariztia', label: 'Certificado Ariztia' },
      { id: 'f30', label: 'Formulario F30' },
      { id: 'permiso_circulacion', label: 'Permiso de circulación' },
    ],
    vehiculo: [
      { id: 'revision_tecnica', label: 'Revisión técnica' },
      { id: 'seguro', label: 'Seguro integral' },
      { id: 'permiso_circulacion', label: 'Permiso de circulación' },
      { id: 'certificado_emisiones', label: 'Certificado de emisiones' },
    ],
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!files.length || !documentType || !expiryDate) {
      alert('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)

    // Simular carga de archivo
    const file = files[0]
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedBy: 'Usuario actual',
      uploadedAt: new Date().toISOString(),
      entityType: entityType as any,
      entityId: entityId || Date.now().toString(),
      entityName,
      documentType: documentType as any,
      expiryDate,
      status: 'validating',
      fileUrl: URL.createObjectURL(file),
    }

    setUploadedDocs(prev => [newDoc, ...prev])
    setFiles([])
    setDocumentType('')
    setExpiryDate('')

    // Simular envío al servidor
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'validating':
        return <Clock className="w-5 h-5 text-amber-600" />
      default:
        return <File className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
      case 'validating':
        return <Badge className="bg-amber-100 text-amber-800">Validando</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800">Pendiente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Zona de carga */}
      <Card>
        <CardHeader>
          <CardTitle>Subir nuevo documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Soporta: PDF, JPG, PNG (máximo 10 MB)
              </p>
              <input
                id="file-input"
                type="file"
                onChange={handleChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* Vista previa del archivo */}
            {files.length > 0 && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700 font-medium">{files[0].name}</span>
                  <span className="text-xs text-slate-500">({(files[0].size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selectores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Selecciona un tipo...</option>
                  {documentTypes[entityType as keyof typeof documentTypes].map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Botón enviar */}
            <button
              onClick={handleUpload}
              disabled={!files.length || !documentType || !expiryDate || isSubmitting}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                files.length && documentType && expiryDate && !isSubmitting
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Subiendo...' : 'Subir documento'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Cola de validación */}
      {uploadedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos cargados ({uploadedDocs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(doc.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 truncate">{doc.originalName}</h4>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{doc.documentType}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Subido: {new Date(doc.uploadedAt).toLocaleDateString('es-CL')}</span>
                          <span>Vence: {new Date(doc.expiryDate).toLocaleDateString('es-CL')}</span>
                        </div>
                        {doc.status === 'rejected' && doc.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                            <strong>Razón del rechazo:</strong> {doc.rejectionReason}
                          </div>
                        )}
                        {doc.status === 'validating' && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                            En proceso de validación por parte de Labbé...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
