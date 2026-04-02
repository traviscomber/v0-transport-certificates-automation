'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  File,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExtractedData {
  [key: string]: any
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'success' | 'error'
  progress: number
  documentType?: string
  error?: string
  extractedData?: ExtractedData
  confidence?: string
}

const documentTypes = [
  { value: 'cedula-identidad', label: 'Cedula de Identidad', category: 'Conductor' },
  { value: 'licencia-conducir', label: 'Licencia de Conducir', category: 'Conductor' },
  { value: 'f30', label: 'Formulario F30', category: 'Vehiculo' },
  { value: 'f30-1', label: 'Formulario F30-1', category: 'Vehiculo' },
  { value: 'permiso-circulacion', label: 'Permiso de Circulacion', category: 'Vehiculo' },
  { value: 'revision-tecnica', label: 'Revision Tecnica', category: 'Vehiculo' },
  { value: 'seguro-obligatorio', label: 'Seguro Obligatorio', category: 'Vehiculo' },
]

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('cedula-identidad')
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [savingFileId, setSavingFileId] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFileWithOCR = async (file: File, documentType: string, fileId: string) => {
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'processing' } : f
        ))

        // Call OCR API
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            documentType: documentType,
            fileName: file.name,
          }),
        })

        if (!response.ok) {
          throw new Error('OCR processing failed')
        }

        const data = await response.json()

        // Update file with extracted data
        setFiles(prev => prev.map(f => 
          f.id === fileId ? {
            ...f,
            status: 'success',
            extractedData: data.extractedData || data,
            confidence: data.confidence || 'unknown'
          } : f
        ))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error al procesar documento'
        } : f
      ))
    }
  }

  const processFile = (file: File, documentType: string): UploadedFile => {
    return {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      documentType: documentType,
    }
  }

  const simulateUpload = (fileId: string, file: File, documentType: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      if (progress > 100) progress = 100
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ))
      
      if (progress >= 100) {
        clearInterval(interval)
        // Start OCR processing
        processFileWithOCR(file, documentType, fileId)
      }
    }, 150)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles = droppedFiles.map(f => processFile(f, selectedType))
    setFiles(prev => [...prev, ...newFiles])
    
    // Start uploads and OCR
    newFiles.forEach((file, idx) => {
      simulateUpload(file.id, droppedFiles[idx], selectedType)
    })
  }, [selectedType])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const newFiles = selectedFiles.map(f => processFile(f, selectedType))
      setFiles(prev => [...prev, ...newFiles])
      
      // Start uploads and OCR
      newFiles.forEach((file, idx) => {
        simulateUpload(file.id, selectedFiles[idx], selectedType)
      })
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (expandedFile === id) setExpandedFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-400" />
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-400" />
    return <File className="h-8 w-8 text-slate-400" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-orange-400 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      default:
        return null
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const handleSaveDocument = async (file: UploadedFile) => {
    if (!file.extractedData) return
    
    try {
      setSavingFileId(file.id)
      
      // Get auth token from session storage or local storage
      const token = localStorage.getItem('sb-auth-token')
      if (!token) {
        alert('Debes iniciar sesion para guardar documentos')
        return
      }

      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: file.documentType,
          fileName: file.name,
          extractedData: file.extractedData,
          confidence: file.confidence,
        }),
      })

      if (!response.ok) {
        throw new Error('Error saving document')
      }

      const data = await response.json()
      
      // Show success message
      alert('Documento guardado correctamente')
      
      // Remove file from list
      removeFile(file.id)
    } catch (error) {
      alert('Error al guardar documento: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setSavingFileId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Upload className="h-8 w-8 text-orange-400" />
          Subir Documentos
        </h1>
        <p className="text-muted-foreground">Carga documentos para validacion automatica con IA (OpenAI Vision)</p>
      </div>

      {/* Document Type Selection */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Tipo de Documento</CardTitle>
          <CardDescription>Selecciona el tipo de documento que vas a subir para extraccion optima de datos</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-96 bg-slate-900 border-slate-700">
              <SelectValue placeholder="Seleccionar tipo de documento..." />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{type.category}</Badge>
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Upload Zone - Mobile Optimized */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-4 sm:p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-12 text-center transition-all ${
              isDragging 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 sm:space-y-4">
              <div className={`mx-auto w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                isDragging ? 'bg-orange-500/20' : 'bg-slate-700'
              }`}>
                <Upload className={`h-6 sm:h-8 w-6 sm:w-8 ${isDragging ? 'text-orange-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-base sm:text-lg font-medium text-foreground">
                  {isDragging ? 'Suelta los archivos aqui' : 'Arrastra y suelta archivos'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  o haz clic para seleccionar archivos
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Formatos soportados: PDF, JPG, PNG | Maximo 10MB por archivo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List - Mobile Optimized */}
      {files.length > 0 && (
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-foreground text-lg sm:text-xl">Archivos ({files.length})</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Documentos en proceso de carga y extraccion con IA</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2 sm:space-y-3">
            {files.map((file) => (
              <div key={file.id} className="space-y-1 sm:space-y-2">
                {/* File Row - Mobile Optimized */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  {/* File Icon and Info */}
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getFileIcon(file.type)}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                        {formatFileSize(file.size)}
                        {file.documentType && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <Badge variant="outline" className="text-xs">{file.documentType}</Badge>
                          </>
                        )}
                      </p>
                      
                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {/* Status Text */}
                      {file.status === 'processing' && (
                        <p className="text-xs text-orange-400 mt-1">Extrayendo datos con IA...</p>
                      )}
                      {file.status === 'success' && file.confidence && (
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <p className="text-xs text-green-400">Datos extraidos</p>
                          <Badge className={`text-xs font-medium border ${getConfidenceColor(file.confidence)}`}>
                            Confianza: {file.confidence}
                          </Badge>
                        </div>
                      )}
                      {file.status === 'error' && (
                        <p className="text-xs text-red-400 mt-1">{file.error || 'Error al procesar'}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {file.extractedData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      >
                        {expandedFile === file.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Data - Mobile Optimized */}
                {expandedFile === file.id && file.extractedData && (
                  <div className="pl-3 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Datos Extraidos:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {Object.entries(file.extractedData)
                        .filter(([key]) => !['success', 'confidence', 'validation', 'documentType', 'fileName'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="text-xs sm:text-sm">
                            <p className="text-muted-foreground capitalize text-xs">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                            <p className="text-foreground font-medium truncate">{String(value || '-')}</p>
                          </div>
                        ))}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 sm:pt-3 border-t border-slate-600">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => handleSaveDocument(file)}
                        disabled={savingFileId === file.id}
                      >
                        {savingFileId === file.id ? (
                          <>
                            <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                            <span className="hidden sm:inline">Guardando...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          'Guardar Documento'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">Consejos para mejores resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Asegurate de que el documento sea legible y este bien iluminado</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Evita fotos borrosas o con reflejos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Incluye todos los bordes del documento en la imagen</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>La IA (OpenAI Vision) extrae automaticamente los datos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
