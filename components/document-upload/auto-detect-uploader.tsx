'use client'

import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { detectDocumentTypeHybrid } from '@/lib/document-detection'
import { DOCUMENT_TYPES } from '@/lib/document-types'
import { cn } from '@/lib/utils'

export interface DetectionState {
  status: 'idle' | 'detecting' | 'detected' | 'error'
  documentCode?: string
  documentName?: string
  confidence?: number
  alternatives?: Array<{ code: string; name: string; confidence: number }>
  error?: string
}

interface AutoDetectUploaderProps {
  onDocumentDetected?: (code: string, confidence: number) => void
  onError?: (error: string) => void
}

export function AutoDetectUploader({ onDocumentDetected, onError }: AutoDetectUploaderProps) {
  const [detection, setDetection] = useState<DetectionState>({ status: 'idle' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setDetection({ status: 'detecting' })

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        // Detect document type
        const result = await detectDocumentTypeHybrid(base64)

        setDetection({
          status: 'detected',
          documentCode: result.documentCode,
          documentName: result.documentName,
          confidence: result.confidence,
          alternatives: result.alternativeSuggestions,
        })

        onDocumentDetected?.(result.documentCode, result.confidence)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setDetection({
        status: 'error',
        error: errorMsg,
      })
      onError?.(errorMsg)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence > 0.85) return 'bg-green-100 text-green-800'
    if (confidence > 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn('border-2 border-dashed transition-colors', {
          'border-primary bg-primary/5': detection.status === 'detecting',
          'border-green-500 bg-green-50': detection.status === 'detected',
          'border-red-500 bg-red-50': detection.status === 'error',
        })}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            {detection.status === 'detecting' && (
              <>
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Analizando documento...</p>
                  <p className="text-sm text-muted-foreground">
                    Identificando tipo de documento
                  </p>
                </div>
              </>
            )}

            {detection.status === 'detected' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-lg">{detection.documentName}</p>
                  <Badge className={getConfidenceBadgeColor(detection.confidence || 0)}>
                    {((detection.confidence || 0) * 100).toFixed(0)}% confianza
                  </Badge>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  )}
                </div>
              </>
            )}

            {detection.status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 text-red-600" />
                <div className="text-center">
                  <p className="font-semibold text-red-600">Error en detección</p>
                  <p className="text-sm text-muted-foreground">{detection.error}</p>
                </div>
              </>
            )}

            {detection.status === 'idle' && (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-semibold">Carga un documento</p>
                  <p className="text-sm text-muted-foreground">
                    Arrastra o haz clic para seleccionar
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Seleccionar archivo
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternatives */}
      {detection.alternatives && detection.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alternativas detectadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detection.alternatives.map((alt) => (
              <div
                key={alt.code}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{alt.name}</p>
                  <p className="text-xs text-muted-foreground">{alt.code}</p>
                </div>
                <Badge variant="outline">
                  {(alt.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Info */}
      {detection.documentCode && DOCUMENT_TYPES[detection.documentCode] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información del documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">CATEGORÍA</p>
              <p className="text-sm">
                {DOCUMENT_TYPES[detection.documentCode].category.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">CAMPOS REQUERIDOS</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {DOCUMENT_TYPES[detection.documentCode].requiredFields.map((field) => (
                  <Badge key={field} variant="secondary">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
            {DOCUMENT_TYPES[detection.documentCode].expirationDays && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">VIGENCIA</p>
                <p className="text-sm">
                  {DOCUMENT_TYPES[detection.documentCode].expirationDays} días
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
