'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface DocumentType {
  id: string
  code: string
  name: string
  category: string
  description: string
}

const categoryLabels: Record<string, string> = {
  empresa: 'Empresa',
  conductor: 'Conductor',
  vehiculo: 'Vehiculo',
  seguridad: 'Seguridad',
  operacional: 'Operacional',
  subcontratacion: 'Subcontratacion',
}

export default function WalmartOCRPage() {
  const searchParams = useSearchParams()
  const preselectedType = searchParams.get('docType')
  
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>(preselectedType || '')
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [activeTab, setActiveTab] = useState('upload')

  const supabase = createClient()

  useEffect(() => {
    fetchDocumentTypes()
  }, [])

  useEffect(() => {
    if (preselectedType) {
      setDocumentType(preselectedType)
    }
  }, [preselectedType])

  const fetchDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('id, code, name, category, description')
        .eq('is_active', true)
        .order('category')
        .order('sort_order')

      if (error) throw error
      setDocumentTypes(data || [])
    } catch (err) {
      console.error('Error fetching document types:', err)
    } finally {
      setLoadingTypes(false)
    }
  }

  // Group documents by category
  const groupedTypes = documentTypes.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, DocumentType[]>)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    if (!documentType) {
      setError('Por favor selecciona un tipo de documento')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/v2/documents/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar documento')
      }

      const data = await response.json()
      setResult(data)
      setActiveTab('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const selectedDocType = documentTypes.find(dt => dt.code === documentType)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portal OCR Walmart Chile</h1>
            <p className="text-muted-foreground">
              Extrae datos automaticamente de {documentTypes.length} documentos de transporte
            </p>
          </div>
          <Link href="/walmart-ocr/compliance">
            <Button variant="outline" className="gap-2">
              Ver Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{documentTypes.length}</div>
              <p className="text-sm text-muted-foreground">Tipos de documento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{Object.keys(groupedTypes).length}</div>
              <p className="text-sm text-muted-foreground">Categorias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">99%</div>
              <p className="text-sm text-muted-foreground">Precision OCR</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Cargar Documento</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Document Type Selector */}
            <Card>
              <CardHeader>
                <CardTitle>1. Seleccionar Tipo de Documento</CardTitle>
                <CardDescription>
                  Elige el tipo de documento que deseas procesar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTypes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-3 border rounded-lg bg-background"
                  >
                    <option value="">-- Seleccionar tipo de documento --</option>
                    {Object.entries(groupedTypes).map(([category, docs]) => (
                      <optgroup key={category} label={categoryLabels[category] || category}>
                        {docs.map((doc) => (
                          <option key={doc.code} value={doc.code}>
                            {doc.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}

                {selectedDocType && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{selectedDocType.name}</span>
                      <Badge variant="outline" className="capitalize">
                        {categoryLabels[selectedDocType.category]}
                      </Badge>
                    </div>
                    {selectedDocType.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedDocType.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>2. Cargar Archivo</CardTitle>
                <CardDescription>
                  Sube una foto o imagen del documento (JPG, PNG, PDF)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click para seleccionar o arrastra un archivo
                    </p>
                    {file ? (
                      <Badge variant="secondary" className="mt-2">
                        {file.name}
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Formatos: JPG, PNG, PDF (max 10MB)
                      </p>
                    )}
                  </label>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!file || !documentType || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando con IA...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Procesar Documento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {result ? (
              <>
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                  <CardHeader>
                    <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Documento Procesado Exitosamente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tipo de Documento</h3>
                        <p className="font-semibold">{result.documentType?.name || documentType}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                        <Badge variant="outline" className="capitalize">
                          {result.documentType?.category || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Confianza de Extraccion
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              (result.confidence || 0) >= 0.9 ? 'bg-green-500' :
                              (result.confidence || 0) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(result.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-lg">
                          {((result.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {result.missingFields && result.missingFields.length > 0 && (
                      <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                          <strong>Campos no encontrados:</strong> {result.missingFields.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Datos Extraidos</CardTitle>
                    <CardDescription>
                      Informacion extraida automaticamente del documento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.extractedData && Object.keys(result.extractedData).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(result.extractedData).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start py-2 border-b last:border-0">
                            <span className="text-sm font-medium text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-semibold text-right max-w-[60%]">
                              {String(value) || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No se extrajeron datos del documento
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setResult(null)
                      setFile(null)
                      setDocumentType('')
                      setActiveTab('upload')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Procesar Otro Documento
                  </Button>
                  <Link href="/walmart-ocr/compliance" className="flex-1">
                    <Button className="w-full">
                      Ver Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Sin Resultados</h3>
                  <p className="text-muted-foreground mb-4">
                    Los resultados apareceran aqui cuando proceses un documento
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('upload')}>
                    Cargar Documento
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
