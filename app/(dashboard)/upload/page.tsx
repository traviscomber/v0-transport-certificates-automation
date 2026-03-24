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
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'success' | 'error'
  progress: number
  documentType?: string
  error?: string
}

const documentTypes = [
  { value: 'licencia_conducir', label: 'Licencia de Conducir', category: 'Conductor' },
  { value: 'cedula_identidad', label: 'Cedula de Identidad', category: 'Conductor' },
  { value: 'hoja_vida_conductor', label: 'Hoja de Vida Conductor', category: 'Conductor' },
  { value: 'revision_tecnica', label: 'Revision Tecnica', category: 'Vehiculo' },
  { value: 'permiso_circulacion', label: 'Permiso de Circulacion', category: 'Vehiculo' },
  { value: 'soap', label: 'SOAP', category: 'Vehiculo' },
  { value: 'seguro_responsabilidad', label: 'Seguro Responsabilidad Civil', category: 'Vehiculo' },
  { value: 'rut_empresa', label: 'RUT Empresa', category: 'Empresa' },
  { value: 'patente_comercial', label: 'Patente Comercial', category: 'Empresa' },
]

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = (file: File): UploadedFile => {
    return {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    }
  }

  const simulateUpload = (fileId: string) => {
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ))
      
      if (progress >= 100) {
        clearInterval(interval)
        // Simulate processing
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'processing' } : f
        ))
        
        // Simulate success after processing
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'success' } : f
          ))
        }, 1500)
      }
    }, 200)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles = droppedFiles.map(processFile)
    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate uploads
    newFiles.forEach(file => simulateUpload(file.id))
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const newFiles = selectedFiles.map(processFile)
      setFiles(prev => [...prev, ...newFiles])
      
      // Simulate uploads
      newFiles.forEach(file => simulateUpload(file.id))
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Upload className="h-8 w-8 text-orange-400" />
          Subir Documentos
        </h1>
        <p className="text-muted-foreground">Carga documentos para validacion automatica con IA</p>
      </div>

      {/* Document Type Selection */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Tipo de Documento</CardTitle>
          <CardDescription>Selecciona el tipo de documento que vas a subir (opcional - la IA lo detectara automaticamente)</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-80 bg-slate-900 border-slate-700">
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

      {/* Upload Zone */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
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
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isDragging ? 'bg-orange-500/20' : 'bg-slate-700'
              }`}>
                <Upload className={`h-8 w-8 ${isDragging ? 'text-orange-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isDragging ? 'Suelta los archivos aqui' : 'Arrastra y suelta archivos'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
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

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">Archivos ({files.length})</CardTitle>
            <CardDescription>Documentos en proceso de carga y validacion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Status Text */}
                  {file.status === 'processing' && (
                    <p className="text-xs text-orange-400 mt-1">Procesando con IA...</p>
                  )}
                  {file.status === 'success' && (
                    <p className="text-xs text-green-400 mt-1">Documento validado correctamente</p>
                  )}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-400 mt-1">{file.error || 'Error al procesar'}</p>
                  )}
                </div>
                
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(file.status)}
                </div>
                
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
              <span>PDFs escaneados tienen mejor precision que fotos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
