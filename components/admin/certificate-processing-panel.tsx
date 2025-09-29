"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  FileText,
  Zap,
} from "lucide-react"

interface CertificateProcessingPanelProps {
  pendingCount: number
  onBulkProcess: () => Promise<void>
}

export function CertificateProcessingPanel({ pendingCount, onBulkProcess }: CertificateProcessingPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingResults, setProcessingResults] = useState<any>(null)

  const handleBulkProcess = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingResults(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch("/api/certificates/bulk-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessingResults(result)

      await onBulkProcess()
    } catch (error) {
      console.error("Bulk processing failed:", error)
      setProcessingResults({
        success: false,
        error: "Error al procesar certificados",
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProcessingProgress(0)
        setProcessingResults(null)
      }, 5000)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Sistema de Procesamiento Automático
          </CardTitle>
          <CardDescription>Procesa y valida certificados automáticamente usando IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Processing Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{isProcessing ? "Procesando..." : "Listo"}</div>
                  <div className="text-sm text-muted-foreground">Estado del Sistema</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{processingResults?.processed || 0}</div>
                  <div className="text-sm text-muted-foreground">Procesados</div>
                </CardContent>
              </Card>
            </div>

            {/* Processing Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Procesamiento en Lote</h3>
                  <p className="text-sm text-muted-foreground">
                    Procesa automáticamente todos los certificados pendientes
                  </p>
                </div>
                <Button
                  onClick={handleBulkProcess}
                  disabled={isProcessing || pendingCount === 0}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Procesar Todo
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del procesamiento</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              )}

              {/* Results */}
              {processingResults && (
                <div className="space-y-4">
                  {processingResults.success ? (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-800 dark:text-green-200">Procesamiento Completado</h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Se procesaron {processingResults.processed} certificados exitosamente.
                      </p>

                      {processingResults.results && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Aprobados: </span>
                            {processingResults.results.filter((r: any) => r.success && r.result?.isValid).length}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Rechazados: </span>
                            {processingResults.results.filter((r: any) => r.success && !r.result?.isValid).length}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-800 dark:text-red-200">Error en el Procesamiento</h4>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {processingResults.error || "Ocurrió un error durante el procesamiento."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Features */}
      <Card>
        <CardHeader>
          <CardTitle>Características del Sistema</CardTitle>
          <CardDescription>Capacidades avanzadas de procesamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Validación con IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Utiliza inteligencia artificial para validar certificados según normativas chilenas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Puntuación de Cumplimiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Calcula automáticamente el nivel de cumplimiento de cada certificado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Evaluación de Riesgo</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifica automáticamente certificados de alto riesgo
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Procesamiento OCR</h4>
                  <p className="text-sm text-muted-foreground">Extrae automáticamente datos de documentos escaneados</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Monitoreo de Vencimientos</h4>
                  <p className="text-sm text-muted-foreground">
                    Detecta automáticamente certificados próximos a vencer
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Procesamiento Continuo</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema que funciona 24/7 procesando nuevos certificados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
