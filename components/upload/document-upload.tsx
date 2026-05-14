"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, AlertCircle, CheckCircle, Calendar, Brain, ImageIcon, FileIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: "uploading" | "completed" | "error" | "analyzing"
  preview?: string
  ocrResults?: any
  analysisError?: string
}

const documentTypes = [
  { value: "f30", label: "Certificado F-30" },
  { value: "f30-1", label: "Certificado F-30-1" },
  { value: "permiso-circulacion", label: "Permiso de Circulación" },
  { value: "licencia-conducir", label: "Licencia de Conducir" },
  { value: "revision-tecnica", label: "Revisión Técnica" },
  { value: "seguro-obligatorio", label: "Seguro Obligatorio" },
  { value: "patente-comercial", label: "Patente Comercial" },
  { value: "otros", label: "Otros Documentos" },
]

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState({
    documentType: "",
    transporterName: "",
    transporterRut: "",
    vehiclePlate: "",
    expiryDate: "",
    notes: "",
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sampleData = urlParams.get("sampleData")

    if (sampleData) {
      try {
        const extractedData = JSON.parse(sampleData)
        setFormData({
          documentType: urlParams.get("documentType") || "",
          transporterName: urlParams.get("transporterName") || "",
          transporterRut: urlParams.get("transporterRut") || "",
          vehiclePlate: urlParams.get("vehiclePlate") || "",
          expiryDate: urlParams.get("expiryDate") || "",
          notes: "Documento de muestra - Datos extraídos automáticamente por OCR",
        })

        // Show sample OCR results
        const sampleFile: UploadedFile = {
          file: new File(["sample"], "documento-muestra.pdf", { type: "application/pdf" }),
          id: "sample-doc",
          progress: 100,
          status: "completed",
          ocrResults: extractedData,
        }
        setFiles([sampleFile])
      } catch (error) {
        console.error("Error parsing sample data:", error)
      }
    }
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "uploading" as const,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      newFiles.forEach((uploadFile) => {
        const uploadDuration = 2000 + Math.random() * 3000 // 2-5 seconds
        const intervalTime = uploadDuration / 20 // 20 updates

        const interval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === uploadFile.id) {
                const increment = Math.random() * 8 + 2 // 2-10% increments
                const newProgress = Math.min(f.progress + increment, 100)
                const newStatus = newProgress >= 100 ? "completed" : "uploading"
                return { ...f, progress: newProgress, status: newStatus }
              }
              return f
            }),
          )
        }, intervalTime)

        setTimeout(() => {
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 100, status: "completed" } : f)),
          )

          // Auto-analyze if document type is selected
          if (formData.documentType) {
            setTimeout(() => analyzeDocument(uploadFile), 500)
          }
        }, uploadDuration)
      })
    },
    [formData.documentType],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const analyzeDocument = async (uploadFile: UploadedFile) => {
    if (!formData.documentType) return

    try {
      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "analyzing" } : f)))

      const formDataToSend = new FormData()
      formDataToSend.append("file", uploadFile.file)
      formDataToSend.append("documentType", formData.documentType)

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "completed", ocrResults: result.extractedData } : f,
          ),
        )

        if (result.extractedData) {
          const extracted = result.extractedData

          const updateFormData = (prev: any) => {
            const updates: any = { ...prev }

            // Map transporter/owner names
            if (extracted.nombreTransportista) updates.transporterName = extracted.nombreTransportista
            else if (extracted.nombrePropietario) updates.transporterName = extracted.nombrePropietario
            else if (extracted.nombreContratante) updates.transporterName = extracted.nombreContratante
            else if (extracted.nombreConductor) updates.transporterName = extracted.nombreConductor

            // Map RUTs
            if (extracted.rutTransportista) updates.transporterRut = extracted.rutTransportista
            else if (extracted.rutPropietario) updates.transporterRut = extracted.rutPropietario
            else if (extracted.rutContratante) updates.transporterRut = extracted.rutContratante
            else if (extracted.rutConductor) updates.transporterRut = extracted.rutConductor

            // Map vehicle plates
            if (extracted.patenteVehiculo) updates.vehiclePlate = extracted.patenteVehiculo
            else if (extracted.patente) updates.vehiclePlate = extracted.patente

            // Map expiry dates
            if (extracted.fechaVencimiento) updates.expiryDate = extracted.fechaVencimiento

            let notes = prev.notes || ""
            if (extracted.confidence) {
              notes += `\nConfianza del OCR: ${extracted.confidence.toUpperCase()}`
            }

            const warnings = Object.keys(extracted).filter((key) => key.endsWith("_warning"))
            if (warnings.length > 0) {
              notes += "\nAdvertencias de validación:"
              warnings.forEach((warning) => {
                notes += `\n- ${extracted[warning]}`
              })
            }

            if (notes.trim()) updates.notes = notes.trim()

            return updates
          }

          setFormData((prev) => updateFormData(prev))
        }
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "error", analysisError: "Error en análisis OCR" } : f,
          ),
        )
      }
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error", analysisError: "Error de conexión" } : f)),
      )
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const documentsToSave = files
      .filter((f) => f.status === "completed")
      .map((f) => ({
        id: f.id,
        fileName: f.file.name,
        fileSize: formatFileSize(f.file.size),
        fileType: f.file.type,
        uploadDate: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
        documentType: getDocumentTypeLabel(formData.documentType),
        ocrData: f.ocrResults || {},
        confidence: f.ocrResults?.confidence || "low",
        status: "pending" as const,
        formData: formData,
      }))

    try {

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documents: documentsToSave }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error saving documents")
      }


      const message = `¡Documentos guardados exitosamente en la base de datos!\n\nDocumentos procesados: ${documentsToSave.length}\nAnálisis OCR exitosos: ${documentsToSave.filter((d) => d.ocrData && Object.keys(d.ocrData).length > 0).length}\n\n¿Deseas ver los documentos guardados?`

      if (confirm(message)) {
        // Navigate to appropriate section based on document type
        const targetPath = getNavigationPath(formData.documentType)

        // Use window.location.href for immediate navigation
        window.location.href = targetPath
      }

      // Clear form after successful save
      setFiles([])
      setFormData({
        documentType: "",
        transporterName: "",
        transporterRut: "",
        vehiclePlate: "",
        expiryDate: "",
        notes: "",
      })
    } catch (error) {
      console.error("[v0] Error saving documents:", error)
      alert(
        `Error al guardar los documentos: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor, inténtalo de nuevo.`,
      )
    }
  }

  const getDocumentTypeLabel = (value: string) => {
    const type = documentTypes.find((t) => t.value === value)
    return type ? type.label : value
  }

  const getNavigationPath = (documentType: string) => {
    switch (documentType) {
      case "f30":
        return "/dashboard/f30"
      case "f30-1":
        return "/dashboard/f30-1"
      case "licencia-conducir":
        return "/dashboard/transporters"
      case "permiso-circulacion":
      case "revision-tecnica":
      case "seguro-obligatorio":
        return "/dashboard/machines"
      default:
        return "/dashboard"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    if (file.type.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (file.type.includes("word")) return <FileIcon className="h-8 w-8 text-blue-600" />
    return <FileIcon className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Información del Documento
          </CardTitle>
          <CardDescription>
            Complete los datos del documento. El sistema analizará automáticamente el contenido con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporterName">Nombre del Transportista *</Label>
                <Input
                  id="transporterName"
                  value={formData.transporterName}
                  onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                  placeholder="Ej: Transportes González Ltda."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporterRut">RUT del Transportista *</Label>
                <Input
                  id="transporterRut"
                  value={formData.transporterRut}
                  onChange={(e) => setFormData({ ...formData, transporterRut: e.target.value })}
                  placeholder="Ej: 12.345.678-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Patente del Vehículo</Label>
                <Input
                  id="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  placeholder="Ej: ABCD-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre el documento..."
                rows={3}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Subir Documentos
          </CardTitle>
          <CardDescription>
            Arrastra y suelta archivos aquí o haz clic para seleccionar. El sistema extraerá automáticamente la
            información usando OCR con IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer 
              transition-all duration-200 ease-in-out
              ${
                isDragActive && !isDragReject
                  ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
                  : isDragReject
                    ? "border-destructive bg-destructive/10"
                    : "border-border hover:border-primary/60 hover:bg-accent/30 hover:shadow-md"
              }
            `}
          >
            <input {...getInputProps()} />

            <div className={`transition-transform duration-200 ${isDragActive ? "scale-110" : ""}`}>
              <Upload
                className={`mx-auto h-16 w-16 mb-6 transition-colors ${
                  isDragActive && !isDragReject
                    ? "text-primary"
                    : isDragReject
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              />
            </div>

            {isDragActive ? (
              isDragReject ? (
                <div>
                  <p className="text-destructive font-medium text-lg mb-2">Tipo de archivo no válido</p>
                  <p className="text-sm text-muted-foreground">Solo se permiten PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              ) : (
                <div>
                  <p className="text-primary font-medium text-lg mb-2">¡Suelta los archivos aquí!</p>
                  <p className="text-sm text-muted-foreground">Los archivos se procesarán automáticamente</p>
                </div>
              )
            ) : (
              <div>
                <p className="text-foreground font-semibold text-lg mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-muted-foreground mb-4">
                  Soporta múltiples archivos • PDF, DOC, DOCX, JPG, PNG • Máximo 10MB por archivo
                </p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivos
                </Button>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Archivos Subidos ({files.length})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar Todo
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="space-y-3">
                    <div className="group flex items-start space-x-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-card">
                      {/* File preview/icon */}
                      <div className="flex-shrink-0">
                        {uploadFile.preview ? (
                          <div className="relative">
                            <img
                              src={uploadFile.preview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                            {getFileIcon(uploadFile.file)}
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <p className="font-medium truncate text-base">{uploadFile.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type || "Tipo desconocido"}
                          </p>
                        </div>

                        {/* Progress bar for uploading files */}
                        {uploadFile.status === "uploading" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Subiendo...</span>
                              <span className="text-muted-foreground">{Math.round(uploadFile.progress)}%</span>
                            </div>
                            <Progress value={uploadFile.progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Status badges and actions */}
                      <div className="flex items-center space-x-3">
                        {uploadFile.status === "completed" && (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                        {uploadFile.status === "uploading" && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Subiendo...
                          </Badge>
                        )}
                        {uploadFile.status === "analyzing" && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Brain className="w-3 h-3 mr-1 animate-pulse" />
                            Analizando IA...
                          </Badge>
                        )}
                        {uploadFile.status === "error" && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}

                        {/* Action buttons */}
                        <div className="flex space-x-1">
                          {uploadFile.status === "completed" && !uploadFile.ocrResults && formData.documentType && (
                            <Button variant="outline" size="sm" onClick={() => analyzeDocument(uploadFile)}>
                              <Brain className="w-3 h-3 mr-1" />
                              Analizar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {uploadFile.ocrResults && (
                      <Card className="ml-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            Información Extraída por IA
                            <Badge
                              variant="secondary"
                              className={`ml-auto ${
                                uploadFile.ocrResults.confidence === "high"
                                  ? "bg-green-100 text-green-700"
                                  : uploadFile.ocrResults.confidence === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              Confianza: {uploadFile.ocrResults.confidence || "desconocida"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Main extracted data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {Object.entries(uploadFile.ocrResults)
                                .filter(
                                  ([key]) =>
                                    !key.endsWith("_warning") &&
                                    !["confidence", "parseError", "rawAnalysis"].includes(key),
                                )
                                .map(([key, value]) => (
                                  <div key={key} className="bg-white/70 p-3 rounded-lg border border-blue-100">
                                    <span className="font-medium text-blue-800 block mb-1 capitalize text-xs uppercase tracking-wide">
                                      {key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase())
                                        .replace("Rut", "RUT")
                                        .replace("Patente", "Patente")}
                                    </span>
                                    <span className="text-gray-800 font-medium">{String(value) || "No detectado"}</span>
                                  </div>
                                ))}
                            </div>

                            {/* Raw analysis data for debugging */}
                            {uploadFile.ocrResults.rawAnalysis && (
                              <details className="bg-white/50 p-3 rounded-lg border border-blue-100">
                                <summary className="font-medium text-blue-800 cursor-pointer text-sm">
                                  Ver análisis completo de IA
                                </summary>
                                <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded border overflow-auto max-h-40">
                                  {JSON.stringify(uploadFile.ocrResults.rawAnalysis, null, 2)}
                                </pre>
                              </details>
                            )}

                            {/* Action buttons for OCR results */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const dataText = Object.entries(uploadFile.ocrResults)
                                    .filter(
                                      ([key]) =>
                                        !key.endsWith("_warning") &&
                                        !["confidence", "parseError", "rawAnalysis"].includes(key),
                                    )
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join("\n")
                                  navigator.clipboard.writeText(dataText)
                                }}
                                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                              >
                                Copiar Datos
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => analyzeDocument(uploadFile)}
                                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                Re-analizar
                              </Button>
                            </div>
                          </div>

                          {/* Validation warnings */}
                          {Object.keys(uploadFile.ocrResults).some((key) => key.endsWith("_warning")) && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Advertencias de Validación:
                              </h5>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {Object.entries(uploadFile.ocrResults)
                                  .filter(([key]) => key.endsWith("_warning"))
                                  .map(([key, value]) => (
                                    <li key={key} className="flex items-start gap-2">
                                      <span className="text-yellow-600 mt-0.5">•</span>
                                      <span>{String(value)}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {uploadFile.analysisError && (
                      <Card className="ml-20 bg-red-50 border-red-200 shadow-sm">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">Error en el análisis</p>
                              <p className="text-sm text-red-700">{uploadFile.analysisError}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 text-red-700 border-red-300 hover:bg-red-100 bg-transparent"
                                onClick={() => analyzeDocument(uploadFile)}
                              >
                                Reintentar Análisis
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {files.length > 0 && (
                <span>
                  {files.filter((f) => f.status === "completed").length} de {files.length} archivos procesados
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={files.length === 0 || !formData.documentType || !formData.transporterName}
                className="min-w-[140px]"
              >
                <FileText className="w-4 h-4 mr-2" />
                Guardar Documento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
