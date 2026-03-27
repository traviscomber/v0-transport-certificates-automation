'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TestOCRPage() {
  const [documentType, setDocumentType] = useState('cedula-identidad')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] API Response:', data)
      setResult(data)
    } catch (err) {
      console.error('[v0] Error:', err)
      setError(err instanceof Error ? err.message : 'Error analizando documento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Test OCR con OpenAI Vision</h1>
          <p className="text-muted-foreground">Sube un documento para extraer datos con IA</p>
        </div>

        {/* Upload Section */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Documento</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="cedula-identidad">Cédula de Identidad</option>
                <option value="licencia-conducir">Licencia de Conducir</option>
                <option value="f30">Formulario F30</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Selecciona Archivo</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
              {file && (
                <p className="text-sm text-green-400 mt-2">✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? 'Analizando...' : 'Analizar Documento'}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Resultados</h2>
              <pre className="bg-slate-900 p-4 rounded overflow-auto text-xs text-green-400 max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
