"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, FileText, Zap, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExtractedData {
  documentType: string
  expiryDate: string
  issueDate: string
  certificateNumber: string
  vehicleId?: string
  driverName?: string
  confidence: number
  rawData?: any
}

export function DocumentScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsScanning(true)
    setScanProgress(0)

    try {
      // Simulate progress while file is being processed
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Send file to the analyze-document API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "f30") // Default to F-30, can be extended for other types

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setScanProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze document")
      }

      const result = await response.json()

      // Transform API response to match ExtractedData interface
      const apiData = result.extractedData
      const extractedData: ExtractedData = {
        documentType: apiData.documentType || apiData.numeroF30 ? "Certificado de Transporte" : "Documento",
        expiryDate: apiData.fechaVencimiento || apiData.fechaVencimiento || "N/A",
        issueDate: apiData.fechaEmision || "N/A",
        certificateNumber: apiData.numeroF30 || apiData.numeroF30_1 || apiData.numeroPoliza || "N/A",
        vehicleId: apiData.patenteVehiculo || apiData.patente || "N/A",
        driverName: apiData.nombreTransportista || apiData.nombrePropietario || apiData.nombreConductor || "N/A",
        confidence: apiData.confidence === "high" ? 0.95 : apiData.confidence === "medium" ? 0.75 : 0.5,
        rawData: apiData, // Store raw data for reference
      }

      setExtractedData(extractedData)
      setIsScanning(false)
    } catch (error) {
      clearInterval(progressInterval)
      setIsScanning(false)
      setScanProgress(0)
      console.error("[v0] Error analyzing document:", error)
      alert(error instanceof Error ? error.message : "Error al analizar el documento. Intenta de nuevo.")
    }
  }

  const handleCameraCapture = () => {
    // In real implementation, this would open camera
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFileUpload(file)
    }
    input.click()
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const saveExtractedData = () => {
    if (extractedData) {
      // In real implementation, save to database
      console.log("[v0] Saving extracted data:", extractedData)
      setExtractedData(null)
      setScanProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Escáner Inteligente de Documentos
          </CardTitle>
          <CardDescription>
            Usa IA para extraer automáticamente datos de certificados y documentos de transporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isScanning && !extractedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleCameraCapture}
                className="h-32 flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Camera className="h-8 w-8" />
                <span>Tomar Foto</span>
                <span className="text-xs opacity-80">Usar cámara del dispositivo</span>
              </Button>

              <Button
                onClick={handleFileSelect}
                variant="outline"
                className="h-32 flex-col gap-2 border-dashed border-2 bg-transparent"
                size="lg"
              >
                <Upload className="h-8 w-8" />
                <span>Subir Archivo</span>
                <span className="text-xs opacity-60">JPG, PNG, PDF</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {isScanning && (
            <div className="text-center space-y-4 py-8">
              <div className="animate-pulse">
                <FileText className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              </div>
              <h3 className="text-lg font-semibold">Procesando documento...</h3>
              <p className="text-muted-foreground">La IA está extrayendo los datos automáticamente</p>
              <div className="max-w-md mx-auto">
                <Progress value={scanProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{scanProgress}% completado</p>
              </div>
            </div>
          )}

          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Datos Extraídos
                </h3>
                <Badge
                  variant={extractedData.confidence > 0.9 ? "default" : "secondary"}
                  className={cn(
                    extractedData.confidence > 0.9 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  {Math.round(extractedData.confidence * 100)}% confianza
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Documento</label>
                  <div className="p-3 bg-muted rounded-md">{extractedData.documentType}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de Certificado</label>
                  <div className="p-3 bg-muted rounded-md">{extractedData.certificateNumber}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Emisión</label>
                  <div className="p-3 bg-muted rounded-md">{extractedData.issueDate}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Fecha de Vencimiento
                    {new Date(extractedData.expiryDate) < new Date() && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </label>
                  <div
                    className={cn(
                      "p-3 rounded-md",
                      new Date(extractedData.expiryDate) < new Date()
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-muted",
                    )}
                  >
                    {extractedData.expiryDate}
                  </div>
                </div>

                {extractedData.vehicleId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID del Vehículo</label>
                    <div className="p-3 bg-muted rounded-md">{extractedData.vehicleId}</div>
                  </div>
                )}

                {extractedData.driverName && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Conductor</label>
                    <div className="p-3 bg-muted rounded-md">{extractedData.driverName}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveExtractedData} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar Datos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedData(null)
                    setScanProgress(0)
                  }}
                >
                  Escanear Otro
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
