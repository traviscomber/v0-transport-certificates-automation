'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, ArrowRight, BookOpen, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { DocumentReferenceGallery } from '@/components/documents/document-reference-gallery'
import { DocumentRequirements } from '@/components/documents/document-requirements'
import { HelpBox, QuickHelp } from '@/components/ui/help-box'

export default function WalmartOCRPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error procesando documento')
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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#18181B]">OCR - Validacion Documental</h1>
        <p className="text-[#71717A]">
          Carga documentos de transporte para validar automaticamente con IA
        </p>
      </div>

      {/* Ayuda Educativa Principal */}
      <HelpBox
        variant="steps"
        title="Como subir y validar un documento"
        description="Sigue estos pasos simples para que el sistema lea tu documento automaticamente:"
        steps={[
          {
            step: 1,
            title: "Selecciona la pestaña 'Cargar Documento'",
            description: "Haz clic en la primera pestaña de arriba si no esta seleccionada."
          },
          {
            step: 2,
            title: "Sube tu archivo",
            description: "Haz clic en el area gris con lineas punteadas, o arrastra tu documento ahi. Puede ser una foto (JPG, PNG) o un PDF."
          },
          {
            step: 3,
            title: "Presiona 'Procesar Documento'",
            description: "El boton azul enviara tu documento a nuestra IA que leera los datos automaticamente."
          },
          {
            step: 4,
            title: "Revisa los resultados",
            description: "Veras los datos extraidos en la pestaña 'Resultados'. Verifica que esten correctos."
          }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Cargar Documento</TabsTrigger>
          <TabsTrigger value="guia" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Galería
          </TabsTrigger>
          <TabsTrigger value="requisitos" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Requisitos
          </TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="border-[#E4E4E7]">
            <CardHeader>
              <CardTitle>Subir Documento</CardTitle>
              <CardDescription>
                Archivos aceptados: PDF, JPG, PNG. Tamaño maximo: 10MB.
              </CardDescription>
            </CardHeader>
            
            {/* Ayuda contextual para subir */}
            <div className="px-6 pb-2">
              <QuickHelp text="Haz clic en el cuadro gris de abajo para buscar tu archivo, o simplemente arrastralo desde tu computador hacia el cuadro." />
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-[#E4E4E7]">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-[#71717A] mb-2" />
                    <p className="mb-2 text-sm text-[#71717A]">
                      <span className="font-semibold">Haz clic aqui para elegir tu archivo</span>
                    </p>
                    <p className="text-sm text-[#71717A] mb-1">o arrastra el documento hacia este cuadro</p>
                    <p className="text-xs text-[#A1A1A1]">Formatos: PDF, JPG, PNG (Tamaño maximo: 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                    <p className="text-xs text-green-700">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Ayuda antes del boton */}
              {uploadedFile && (
                <QuickHelp text="Perfecto, tu archivo esta listo. Ahora presiona el boton azul de abajo para que la IA lea los datos del documento." />
              )}

              <Button
                onClick={handleUpload}
                disabled={!uploadedFile || loading}
                className="w-full bg-[#0066FF] text-white hover:bg-[#0052CC] h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando documento... espera un momento
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Procesar Documento con IA
                  </>
                )}
              </Button>
              
              {!uploadedFile && (
                <p className="text-center text-sm text-muted-foreground">
                  Primero selecciona un archivo arriba para activar este boton
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guia" className="space-y-6">
          <Card className="border-[#E4E4E7]">
            <CardHeader>
              <CardTitle>Galería de Documentos Chilenos</CardTitle>
              <CardDescription>
                Ejemplos visuales de los documentos de transporte más comunes en Chile. Haz clic en cualquiera para ampliar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentReferenceGallery />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitos" className="space-y-6">
          <Card className="border-[#E4E4E7]">
            <CardHeader>
              <CardTitle>Información de Documentos</CardTitle>
              <CardDescription>
                Requisitos detallados para cada documento obligatorio en transporte chileno.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentRequirements />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {result ? (
            <Card className="border-[#E4E4E7]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Documento Validado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {result.extractedData && Object.entries(result.extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start border-b pb-3">
                      <span className="text-sm font-medium text-[#71717A] capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-[#18181B] font-semibold">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {result.validationStatus && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900">
                      <span className="font-semibold">Estado:</span> {result.validationStatus}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setUploadedFile(null)
                    setResult(null)
                    setActiveTab('upload')
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Procesar Otro Documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#E4E4E7]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="w-12 h-12 text-[#A1A1A1] mb-4" />
                <p className="text-lg font-medium text-[#71717A]">Sin resultados</p>
                <p className="text-sm text-[#A1A1A1] mt-2">
                  Carga un documento para ver los resultados aquí
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <HelpBox
        variant="tip"
        title="Consejos para mejores resultados"
        tips={[
          "Asegurate de que la foto del documento este bien iluminada y no tenga sombras.",
          "El documento debe verse completo en la imagen, sin partes cortadas.",
          "Si el documento tiene varias paginas, sube cada pagina por separado.",
          "Los formatos aceptados son: PDF, JPG y PNG. El tamaño maximo es 10MB.",
          "Puedes usar la pestaña 'Galeria' para ver ejemplos de como se ven los documentos chilenos.",
          "La pestaña 'Requisitos' te explica que informacion debe tener cada tipo de documento."
        ]}
      />
    </div>
  )
}
