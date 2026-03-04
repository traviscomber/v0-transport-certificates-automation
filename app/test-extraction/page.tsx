"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader, Check, X, AlertCircle, Code } from "lucide-react"
import { useDropzone } from "react-dropzone"

const documentTypes = [
  { value: "f30", label: "Certificado F-30" },
  { value: "f30-1", label: "Certificado F-30-1" },
  { value: "licencia-conducir", label: "Licencia de Conducir" },
  { value: "revision-tecnica", label: "Revisión Técnica" },
  { value: "permiso-circulacion", label: "Permiso de Circulación" },
  { value: "seguro-obligatorio", label: "Seguro Obligatorio" },
]

export default function TestExtractionPage() {
  const [documentType, setDocumentType] = useState("f30")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setSelectedFile(file)
        setError(null)
        setResult(null)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
  })

  const handleTest = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona un archivo")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("documentType", documentType)

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(data.error || "Error al analizar el documento")
        return
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Test de Extracción de Documentos</h1>
          <p className="text-slate-600">Verifica que la extracción con OpenAI Vision funciona correctamente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Selecciona un Documento</CardTitle>
              <CardDescription>Sube una imagen de un certificado o licencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document Type Selector */}
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Zone */}
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-600">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <p className="text-sm text-slate-500 mt-2">Soportados: JPG, PNG, WebP</p>
              </div>

              {/* Preview */}
              {preview && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {/* Test Button */}
              <Button
                onClick={handleTest}
                disabled={!selectedFile || loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 animate-spin" size={20} />
                    Analizando...
                  </>
                ) : (
                  "Analizar Documento"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Check className="text-green-600" size={24} />
                    Extracción Exitosa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="parsed" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="parsed">Datos Extraídos</TabsTrigger>
                      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parsed" className="space-y-4 mt-4">
                      {result.extractedData && (
                        <div className="space-y-3">
                          {Object.entries(result.extractedData).map(([key, value]: [string, any]) => (
                            <div key={key} className="bg-white p-3 rounded border border-green-200">
                              <p className="text-sm font-semibold text-slate-600 capitalize">{key.replace(/_/g, " ")}</p>
                              <p className="text-slate-900 mt-1">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="raw" className="mt-4">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
                        {rawResponse}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {!result && !error && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code size={20} />
                    Información del Proceso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">¿Qué sucede al enviar?</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Se convierte la imagen a base64</li>
                      <li>Se envía a OpenAI Vision (gpt-4o)</li>
                      <li>Se extrae la información con un prompt específico</li>
                      <li>Se valida y retorna los datos estructurados</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">Campos extraídos:</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>• Números de documento</li>
                      <li>• RUT/Identificación</li>
                      <li>• Fechas de emisión/vencimiento</li>
                      <li>• Información personal</li>
                      <li>• Datos del vehículo</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
