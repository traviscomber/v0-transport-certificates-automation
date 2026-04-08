'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2, Check, AlertCircle, FileText, Eye } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

type DocumentType = 'f30' | 'licencia_conducir' | 'revision_tecnica' | 'permiso_circulacion'

interface AnalysisResult {
  success: boolean
  extractedData: Record<string, any>
  rawResponse: string
}

export default function AdminUploadPage() {
  const [documentType, setDocumentType] = useState<DocumentType>('f30')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; timestamp: string; status: 'success' | 'error' }>>([])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        setError(null)
        setResult(null)

        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
      }
    },
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  })

  const analyzeDocument = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al analizar el documento')
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error'
        }])
        return
      }

      setResult(data)
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      }])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error'
      }])
    } finally {
      setLoading(false)
    }
  }

  const documentTypeLabels: Record<DocumentType, string> = {
    f30: 'Certificado F-30',
    licencia_conducir: 'Licencia de Conducir',
    revision_tecnica: 'Revisión Técnica',
    permiso_circulacion: 'Permiso de Circulación'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Carga de Documentos</h1>
          <p className="text-slate-400">Análisis OCR con OpenAI Vision para certificados y licencias chilenas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Type Selection */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Paso 1: Tipo de Documento</CardTitle>
                <CardDescription>Selecciona el tipo de documento a analizar</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-slate-600">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Upload Zone */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Paso 2: Cargar Documento</CardTitle>
                <CardDescription>Arrastra un archivo o haz clic para seleccionar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition"
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-white font-medium text-lg">Arrastra tu documento aquí</p>
                  <p className="text-slate-400 mt-2">o haz clic para seleccionar (JPG, PNG, WebP)</p>
                </div>

                {preview && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">Vista Previa</p>
                    <div className="relative w-full h-64 bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={analyzeDocument}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Analizar Documento
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setFile(null)
                          setPreview(null)
                          setResult(null)
                          setError(null)
                        }}
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Limpiar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {(result || error) && (
              <Card className={result ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {result ? (
                      <>
                        <Check className="text-green-500" size={24} />
                        <CardTitle className="text-green-500">Análisis Exitoso</CardTitle>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-500" size={24} />
                        <CardTitle className="text-red-500">Error en Análisis</CardTitle>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/40 border-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <Tabs defaultValue="parsed" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                        <TabsTrigger value="parsed" className="text-white">
                          Datos Extraídos
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="text-white">
                          Raw JSON
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="parsed" className="space-y-3 mt-4">
                        {result.extractedData && Object.keys(result.extractedData).length > 0 ? (
                          Object.entries(result.extractedData).map(([key, value]) => (
                            <div key={key} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-white font-mono mt-2 text-sm">{String(value)}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400">No se extrajeron datos</p>
                        )}
                      </TabsContent>

                      <TabsContent value="raw" className="mt-4">
                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96 border border-slate-700">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Activity & Info */}
          <div className="space-y-6">
            {/* Historial */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Historial de Cargas</CardTitle>
                <CardDescription>Últimas {uploadedFiles.length} operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <p className="text-slate-400 text-sm">Sin cargas aún</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uploadedFiles.slice().reverse().map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-700/50 border border-slate-600">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{file.timestamp}</p>
                        </div>
                        <Badge
                          className={file.status === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                        >
                          {file.status === 'success' ? 'OK' : 'Error'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Eye size={20} />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white mb-2">Formatos Soportados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>JPG / JPEG</li>
                    <li>PNG</li>
                    <li>WebP</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <p className="font-semibold text-white mb-2">Características:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Análisis OCR con IA</li>
                    <li>Extracción automática</li>
                    <li>Validación de datos</li>
                    <li>Detección de vencimiento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
