'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, AlertCircle, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface VisionDetailProps {
  documentId: string
  documentType?: string
  extractedData?: any
  anomaliesDetected?: string[]
  ocrText?: string
  visionError?: string
  onRescan?: (docId: string) => void
}

export function VisionDetail({
  documentId,
  documentType,
  extractedData,
  anomaliesDetected,
  ocrText,
  visionError,
  onRescan,
}: VisionDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!documentType && !extractedData && !anomaliesDetected && !ocrText && !visionError) {
    return null
  }

  return (
    <Card className="mt-4 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resultado del Escaneo
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {visionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Error en el escaneo</p>
                <p className="text-sm text-red-700 mt-1">{visionError}</p>
                {onRescan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRescan(documentId)}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          )}

          {documentType && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Tipo de Documento</h4>
              <Badge variant="outline" className="bg-blue-50">
                {documentType}
              </Badge>
            </div>
          )}

          {extractedData && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Datos Extraídos</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                {extractedData.person_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{extractedData.person_name}</span>
                  </div>
                )}
                {extractedData.person_rut && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RUT:</span>
                    <span className="font-medium">{extractedData.person_rut}</span>
                  </div>
                )}
                {extractedData.validity_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Vencimiento:</span>
                    <span className="font-medium text-orange-600">{extractedData.validity_date}</span>
                  </div>
                )}
                {extractedData.document_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número Documento:</span>
                    <span className="font-medium">{extractedData.document_number}</span>
                  </div>
                )}
                {extractedData.company_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Empresa:</span>
                    <span className="font-medium">{extractedData.company_name}</span>
                  </div>
                )}
                {extractedData.key_data && Object.keys(extractedData.key_data).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-muted-foreground mb-2">Otros datos:</p>
                    {Object.entries(extractedData.key_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {anomaliesDetected && anomaliesDetected.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Anomalías Detectadas</h4>
              <div className="space-y-2">
                {anomaliesDetected.map((anomaly, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{anomaly}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ocrText && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Texto Extraído (OCR)</h4>
              <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <p className="text-xs whitespace-pre-wrap text-foreground/80">{ocrText}</p>
              </div>
            </div>
          )}

          {!extractedData && !ocrText && !anomaliesDetected && !visionError && (
            <div className="text-sm text-muted-foreground">
              No hay datos extraídos disponibles
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
