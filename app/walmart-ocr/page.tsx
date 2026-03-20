'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function WalmartOCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

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
        throw new Error('Error al procesar documento')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portal OCR Walmart Chile</h1>
          <p className="text-gray-600">Extrae datos automáticamente de 35+ documentos de transporte</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Cargar Documento</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Tipo de Documento</CardTitle>
                <CardDescription>
                  Elige el tipo de documento que deseas procesar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Seleccionar --</option>
                  <optgroup label="Empresa">
                    <option value="RUT-EMPRESA">RUT Empresa</option>
                    <option value="ESCRITURA-CONSTITUCION">Escritura de Constitución</option>
                    <option value="CERTIFICADO-VIGENCIA">Certificado de Vigencia</option>
                    <option value="PODER-REPRESENTANTE">Poder del Representante</option>
                    <option value="CEDULA-REPRESENTANTE">Cédula Representante Legal</option>
                  </optgroup>
                  <optgroup label="Conductor">
                    <option value="CEDULA-IDENTIDAD">Cédula de Identidad</option>
                    <option value="LICENCIA-CONDUCIR">Licencia de Conducir Profesional</option>
                    <option value="HOJA-VIDA">Hoja de Vida</option>
                    <option value="CERTIFICADO-ANTECEDENTES">Certificado de Antecedentes</option>
                    <option value="INHABILIDADES-MENORES">Inhabilidades Menores</option>
                    <option value="CONTRATO-TRABAJO">Contrato de Trabajo</option>
                    <option value="CERTIFICADO-AFP">Certificado AFP</option>
                    <option value="CERTIFICADO-SALUD">Certificado de Salud</option>
                    <option value="EXAMEN-PREOCUPACIONAL">Examen Preocupacional</option>
                  </optgroup>
                  <optgroup label="Vehículo">
                    <option value="PADRON-INSCRIPCION">Padrón/Certificado Inscripción</option>
                    <option value="PERMISO-CIRCULACION">Permiso de Circulación</option>
                    <option value="REVISION-TECNICA">Revisión Técnica</option>
                    <option value="CERTIFICADO-EMISIONES">Certificado de Emisiones</option>
                    <option value="SEGURO-SOAP">Seguro SOAP</option>
                    <option value="SEGURO-CARGA">Seguro de Carga</option>
                    <option value="SEGURO-RESPONSABILIDAD">Seguro Responsabilidad Civil</option>
                    <option value="FOTOGRAFIA-GPS">Fotografía + GPS</option>
                  </optgroup>
                  <optgroup label="Seguridad">
                    <option value="REGLAMENTO-INTERNO">Reglamento Interno</option>
                    <option value="PROCEDIMIENTOS-SEGURIDAD">Procedimientos Trabajo Seguro</option>
                    <option value="MATRIZ-RIESGOS">Matriz de Riesgos</option>
                    <option value="CAPACITACIONES">Capacitaciones</option>
                    <option value="PROTOCOLOS-ACCIDENTES">Protocolos de Accidentes</option>
                  </optgroup>
                  <optgroup label="Operacional">
                    <option value="GUIA-DESPACHO">Guía de Despacho</option>
                    <option value="ORDEN-TRANSPORTE">Orden de Transporte</option>
                    <option value="CARTA-PORTE">Carta de Porte</option>
                    <option value="DOCUMENTOS-CARGA">Documentos de Carga</option>
                    <option value="REGISTRO-ENTREGA">Registro de Entrega</option>
                  </optgroup>
                  <optgroup label="Subcontratación">
                    <option value="CONTRATOS-SUBCONTRATACION">Contratos de Subcontratación</option>
                    <option value="F30-1">F-30-1 Actualizado</option>
                    <option value="CUMPLIMIENTO-PREVISIONAL">Cumplimiento Previsional</option>
                  </optgroup>
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cargar Archivo</CardTitle>
                <CardDescription>
                  Sube una foto o imagen del documento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && (
                  <p className="text-sm text-gray-600">
                    Archivo seleccionado: {file.name}
                  </p>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={!file || !documentType || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
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
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Documento Procesado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Tipo de Documento</h3>
                      <p className="text-sm">{result.documentType.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Confianza: {(result.confidence * 100).toFixed(1)}%</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    {result.missingFields.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-yellow-900">Campos faltantes</h3>
                        <p className="text-sm text-yellow-800">
                          {result.missingFields.join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Datos Extraídos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                      {JSON.stringify(result.extractedData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => {
                    setResult(null)
                    setFile(null)
                    setDocumentType('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Procesar Otro Documento
                </Button>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Los resultados aparecerán aquí cuando proceses un documento
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
