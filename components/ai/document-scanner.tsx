"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, FileText, Zap, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExtractedData {
  [key: string]: any
  documentType?: string
  confidence?: number | string
}

export function DocumentScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsScanning(true)
    setScanProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress while file is being processed
      progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Auto-detect document type based on common characteristics
      // For identity documents, we default to "cedula-identidad" for better results
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "cedula-identidad") // Default to Chilean ID for best results

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      })

      if (progressInterval) clearInterval(progressInterval)
      setScanProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze document")
      }

      const result = await response.json()

      // Use all extracted data directly
      const apiData = result.extractedData
      const extracted: ExtractedData = {
        ...apiData, // Include ALL fields from API response
      }

      setExtractedData(extracted)
      setIsScanning(false)
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval)
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
                  variant={
                    typeof extractedData.confidence === "string"
                      ? extractedData.confidence === "high"
                        ? "default"
                        : "secondary"
                      : (extractedData.confidence ?? 0) > 0.9
                        ? "default"
                        : "secondary"
                  }
                  className={cn(
                    typeof extractedData.confidence === "string"
                      ? extractedData.confidence === "high"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      : (extractedData.confidence ?? 0) > 0.9
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  {typeof extractedData.confidence === "string"
                    ? extractedData.confidence.charAt(0).toUpperCase() + extractedData.confidence.slice(1)
                    : `${Math.round((extractedData.confidence ?? 0) * 100)}%`}{" "}
                  confianza
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extractedData).map(([key, value]) => {
                  // Skip internal fields
                  if (key === "confidence" || key === "parseError" || key.endsWith("_warning")) return null

                  // Format the label with proper Spanish labels for Chilean documents
                  const labelMap: Record<string, string> = {
                    rut: "RUT",
                    nombreCompleto: "Nombre Completo",
                    nombre: "Nombre",
                    apellidos: "Apellidos",
                    fechaNacimiento: "Fecha de Nacimiento",
                    sexo: "Sexo",
                    fechaEmision: "Fecha de Emisión",
                    fechaVencimiento: "Fecha de Vencimiento",
                    numeroCedula: "Número de Cédula",
                    lugarNacimiento: "Lugar de Nacimiento",
                    comunaResidencia: "Comuna de Residencia",
                    estadoCivil: "Estado Civil",
                    profesion: "Profesión",
                    altura: "Altura",
                    senaParticular: "Seña Particular",
                    numeroPasaporte: "Número de Pasaporte",
                    nacionalidad: "Nacionalidad",
                    numeroF30: "Número F-30",
                    rutTransportista: "RUT Transportista",
                    nombreTransportista: "Nombre Transportista",
                    patenteVehiculo: "Patente Vehículo",
                    tipoVehiculo: "Tipo de Vehículo",
                    estado: "Estado",
                    observaciones: "Observaciones",
                    numeroResolucion: "Número de Resolución",
                    region: "Región",
                    numeroF30_1: "Número F-30-1",
                    capacidadCarga: "Capacidad de Carga",
                    tipoCarga: "Tipo de Carga",
                    patente: "Patente",
                    rutPropietario: "RUT Propietario",
                    nombrePropietario: "Nombre Propietario",
                    marca: "Marca",
                    modelo: "Modelo",
                    ano: "Año",
                    color: "Color",
                    numeroMotor: "Número de Motor",
                    numeroChasis: "Número de Chasis",
                    uso: "Uso del Vehículo",
                    numeroLicencia: "Número de Licencia",
                    claseLicencia: "Clase de Licencia",
                    rutConductor: "RUT Conductor",
                    nombreConductor: "Nombre Conductor",
                    restricciones: "Restricciones",
                    municipalidad: "Municipalidad",
                    donante: "Donante de Órganos",
                    companiaSeguro: "Compañía de Seguros",
                    numeroPoliza: "Número de Póliza",
                    rutContratante: "RUT Contratante",
                    nombreContratante: "Nombre Contratante",
                    fechaInicio: "Fecha de Inicio",
                    prima: "Prima",
                    agente: "Agente o Corredor",
                    sucursal: "Sucursal",
                    plantaRevisora: "Planta Revisora",
                    fechaRevision: "Fecha de Revisión",
                    kilometraje: "Kilometraje",
                  }

                  const label = labelMap[key] || key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()

                  // Handle different value types
                  let displayValue = value
                  if (value === null || value === undefined) displayValue = "N/A"
                  if (typeof value === "object") displayValue = JSON.stringify(value)

                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <div className="p-3 bg-muted rounded-md text-sm break-words font-mono">{String(displayValue)}</div>
                    </div>
                  )
                })}
              </div>

              {extractedData.parseError && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {extractedData.parseError}
                  </p>
                  {extractedData.rawAnalysis && (
                    <p className="text-xs text-yellow-700 mt-2 p-2 bg-white rounded border border-yellow-100">
                      {extractedData.rawAnalysis}
                    </p>
                  )}
                </div>
              )}

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
