'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function TestOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('cedula-identidad')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
      setResult(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Test OCR con OpenAI Vision</h1>
          <p className="text-muted-foreground">Prueba el sistema de escaneo de documentos con IA</p>
        </div>

        {/* Upload Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Subir Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Documento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDocumentType('cedula-identidad')}
                  className={`p-2 rounded border ${documentType === 'cedula-identidad' ? 'bg-primary border-primary' : 'border-slate-600'}`}
                >
                  Cédula
                </button>
                <button
                  onClick={() => setDocumentType('licencia-conducir')}
                  className={`p-2 rounded border ${documentType === 'licencia-conducir' ? 'bg-primary border-primary' : 'border-slate-600'}`}
                >
                  Licencia
                </button>
                <button
                  onClick={() => setDocumentType('f30')}
                  className={`p-2 rounded border ${documentType === 'f30' ? 'bg-primary border-primary' : 'border-slate-600'}`}
                >
                  F30
                </button>
                <button
                  onClick={() => setDocumentType('permiso-circulacion')}
                  className={`p-2 rounded border ${documentType === 'permiso-circulacion' ? 'bg-primary border-primary' : 'border-slate-600'}`}
                >
                  Permiso
                </button>
              </div>
            </div>

            {/* File Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Archivo</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setSelectedFile(file)
                }}
                className="w-full border border-slate-600 rounded p-2 bg-slate-900 text-white"
              />
              {selectedFile && (
                <p className="text-sm text-green-400 mt-2">✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
              )}
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                'Analizar Documento'
              )}
            </Button>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
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
                      ? result.confidence === 'high'
                        ? '85%'
                        : result.confidence === 'medium'
                          ? '60%'
                          : '35%'
                      : `${result.confidence}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                    style={{
                      width: `${
                        typeof result.confidence === 'string'
                          ? result.confidence === 'high'
                            ? '85'
                            : result.confidence === 'medium'
                              ? '60'
                              : '35'
                          : result.confidence
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Extracted Data */}
              <div>
                <h3 className="font-medium mb-3">Datos Extraídos</h3>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(result)
                    .filter(([key]) => !['confidence', 'validation', 'success', 'documentType', 'fileName'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm border-b border-slate-700 pb-2 last:border-0">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-foreground font-medium">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Validation */}
              {result.validation && (
                <div>
                  <h3 className="font-medium mb-2">Validación</h3>
                  <p className={`text-sm ${result.validation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.validation.isValid ? '✓ Documento válido' : '✗ Documento inválido'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
