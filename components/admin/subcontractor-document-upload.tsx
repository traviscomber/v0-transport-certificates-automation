'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SubcontractorDocumentUploadProps {
  subcontractorId: string
  onUploadSuccess?: () => void
}

interface AnalysisResult {
  success: boolean
  analysis: {
    documentType: string
    expirationDate: string | null
    confidence: number
    extractedText: string
    warnings: string[]
  }
  alertsGenerated: boolean
}

export function SubcontractorDocumentUpload({ subcontractorId, onUploadSuccess }: SubcontractorDocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('Contract')
  const [expiryDate, setExpiryDate] = useState('')
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const categories = [
    'Insurance',
    'Certification',
    'Contract',
    'Inspection Report',
    'Training Certificate',
    'Other'
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    formData.append('subcontractorId', subcontractorId)
    formData.append('category', selectedCategory)
    if (expiryDate) {
      formData.append('expiryDate', expiryDate)
    }

    try {
      const response = await fetch('/api/company/documents/subcontractors/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error uploading document')
      }

      const data = await response.json()
      setMessage({ type: 'success', text: `${files.length} documento(s) subido(s) y analizando...` })
      
      // Wait a bit for auto-analysis to complete, then show results
      setAnalyzing(true)
      setTimeout(async () => {
        if (data.documents && data.documents.length > 0) {
          // Fetch the first document's analysis results
          try {
            const docId = data.documents[0].id
            const analysisResponse = await fetch(`/api/company/documents/${docId}`, {
              method: 'GET',
            })
            
            if (analysisResponse.ok) {
              const docData = await analysisResponse.json()
              
              // Extract AI analysis results
              const result: AnalysisResult = {
                success: true,
                analysis: {
                  documentType: docData.ai_document_type || 'No detectado',
                  expirationDate: docData.ai_expiration_date || null,
                  confidence: docData.ai_confidence || 0,
                  extractedText: docData.ai_extracted_text || '',
                  warnings: docData.ai_warnings || [],
                },
                alertsGenerated: !!docData.ai_expiration_date,
              }
              
              setAnalysisResult(result)
              setShowAnalysisModal(true)
            }
          } catch (error) {
            console.error('[v0] Error fetching analysis results:', error)
          }
        }
        setAnalyzing(false)
        onUploadSuccess?.()
      }, 2000) // Wait 2 seconds for analysis to complete
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al subir documento'
      })
      setAnalyzing(false)
    } finally {
      setUploading(false)
      setIsDragging(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Documentos de Subcontratista</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium">Tipo de Documento</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-sm font-medium">Fecha de Vencimiento (Opcional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG, PNG, DOCX - Máximo 50MB
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="file-input"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
            disabled={uploading}
          />
          <label htmlFor="file-input" className="block mt-4">
            <Button disabled={uploading} variant="outline" type="button">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Seleccionar Archivos'
              )}
            </Button>
          </label>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex gap-2 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
            {analyzing && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
          </div>
        )}

        {/* Analysis Results Modal */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Resultados del Analisis IA
              </DialogTitle>
            </DialogHeader>
            
            {analysisResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Tipo Detectado</p>
                    <p className="text-sm font-medium">{analysisResult.analysis.documentType}</p>
                  </div>
                  
                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Confianza</p>
                    <p className="text-sm font-medium">
                      {Math.round(analysisResult.analysis.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {analysisResult.analysis.expirationDate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 font-medium">Fecha de Vencimiento</p>
                    <p className="text-sm text-yellow-900">
                      {new Date(analysisResult.analysis.expirationDate).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                )}

                {analysisResult.analysis.extractedText && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-2">Informacion Extraida</p>
                    <p className="text-sm text-slate-700">{analysisResult.analysis.extractedText}</p>
                  </div>
                )}

                {analysisResult.alertsGenerated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">✓ Alertas de vencimiento generadas automaticamente</p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
