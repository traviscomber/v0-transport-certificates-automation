'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('cedula-identidad')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const documentTypes = [
    { value: 'cedula-identidad', label: 'Cédula de Identidad' },
    { value: 'licencia-conducir', label: 'Licencia de Conducir' },
    { value: 'f30', label: 'Formulario F30' },
    { value: 'f30-1', label: 'Formulario F30-1' },
    { value: 'permiso-circulacion', label: 'Permiso de Circulación' },
    { value: 'revision-tecnica', label: 'Revisión Técnica' },
    { value: 'seguro-obligatorio', label: 'Seguro Obligatorio' },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentType', documentType)

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[v0] Result received:', data)
      setResult(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.log('[v0] Error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Test OCR con OpenAI Vision</h1>
          <p className="text-muted-foreground">Prueba el sistema de escaneo de documentos con IA</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Subir Documento</CardTitle>
            <CardDescription>Selecciona un tipo de documento y sube una imagen o PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Tipo de Documento</label>
              <div className="grid grid-cols-2 gap-2">
                {documentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDocumentType(type.value)}
                    className={`p-3 rounded-lg text-sm font-medium transition ${
                      documentType === type.value
                        ? 'bg-primary text-white'
                        : 'bg-slate-700 text-muted-foreground hover:bg-slate-600'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Archivo</label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary"
              />
              {selectedFile && (
                <p className="text-sm text-green-400 mt-2">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Error</p>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Analizando...' : 'Analizar Documento'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Resultados del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confidence */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Confianza de Extracción</label>
                  <span className="text-lg font-bold text-primary">
                    {typeof result.confidence === 'string' 
                      ? (result.confidence === 'high' ? 85 : result.confidence === 'medium' ? 60 : 35)
                      : result.confidence}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${typeof result.confidence === 'string' 
                        ? (result.confidence === 'high' ? 85 : result.confidence === 'medium' ? 60 : 35)
                        : result.confidence}%` 
                    }}
                  />
                </div>
              </div>

              {/* Extracted Data */}
              <div>
                <h3 className="font-medium mb-3">Datos Extraídos</h3>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(result).map(([key, value]: [string, any]) => {
                    // Skip metadata fields
                    if (['confidence', 'validation', 'raw', 'success', 'documentType', 'fileName', 'extractedData'].includes(key)) {
                      return null
                    }
                    
                    return (
                      <div key={key} className="flex justify-between text-sm border-b border-slate-700 pb-2">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="text-foreground font-medium">{String(value)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Validation Results */}
              {result.validation && Object.keys(result.validation).length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Validación</h3>
                  <div className="space-y-2">
                    {Object.entries(result.validation).map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg flex items-center gap-2 ${
                          value === true
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {value === true ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {key}: {value === true ? 'Válido' : 'Inválido'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
