'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VisionResultsDialogProps {
  documentType?: string
  extractedData?: any
  anomaliesDetected?: string[]
  ocrText?: string
  visionError?: string
}

export function VisionResultsDialog({
  documentType,
  extractedData,
  anomaliesDetected,
  ocrText,
  visionError
}: VisionResultsDialogProps) {
  if (!extractedData && !ocrText && !visionError) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resultados del escaneo de visión</DialogTitle>
        </DialogHeader>

        {visionError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Error en el escaneo</h3>
            <p className="text-red-800 text-sm">{visionError}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Document Type */}
            <div>
              <h3 className="font-semibold mb-2">Tipo de documento</h3>
              <Badge className="text-sm">{documentType || 'No detectado'}</Badge>
            </div>

            {/* Extracted Data */}
            {extractedData && (
              <div>
                <h3 className="font-semibold mb-3">Información extraída</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  {extractedData.document_number && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">Número de documento:</span>
                      <span className="text-sm">{extractedData.document_number}</span>
                    </div>
                  )}
                  {extractedData.person_name && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">Nombre:</span>
                      <span className="text-sm">{extractedData.person_name}</span>
                    </div>
                  )}
                  {extractedData.person_rut && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">RUT:</span>
                      <span className="text-sm">{extractedData.person_rut}</span>
                    </div>
                  )}
                  {extractedData.validity_date && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">Fecha de validez:</span>
                      <span className="text-sm">{extractedData.validity_date}</span>
                    </div>
                  )}
                  {extractedData.company_name && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium">Empresa:</span>
                      <span className="text-sm">{extractedData.company_name}</span>
                    </div>
                  )}
                  {extractedData.key_data && Object.keys(extractedData.key_data).length > 0 && (
                    <div className="border-t pt-3">
                      <span className="text-sm font-medium block mb-2">Datos adicionales:</span>
                      <div className="space-y-2">
                        {Object.entries(extractedData.key_data).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start text-sm">
                            <span className="text-gray-600">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Issues */}
            {extractedData?.quality_issues && extractedData.quality_issues.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-yellow-900">Problemas de calidad</h3>
                <ul className="space-y-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  {extractedData.quality_issues.map((issue: string, idx: number) => (
                    <li key={idx} className="text-sm text-yellow-800">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anomalies */}
            {anomaliesDetected && anomaliesDetected.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-red-900">Anomalías detectadas</h3>
                <ul className="space-y-1 bg-red-50 border border-red-200 rounded-lg p-3">
                  {anomaliesDetected.map((anomaly: string, idx: number) => (
                    <li key={idx} className="text-sm text-red-800">• {anomaly}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* OCR Text */}
            {ocrText && (
              <div>
                <h3 className="font-semibold mb-2">Texto extraído (OCR)</h3>
                <div className="bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{ocrText}</p>
                </div>
              </div>
            )}

            {/* Readability Status */}
            {extractedData?.is_readable !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado de legibilidad:</span>
                <Badge variant={extractedData.is_readable ? 'default' : 'destructive'}>
                  {extractedData.is_readable ? 'Legible' : 'No legible'}
                </Badge>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
