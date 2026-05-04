"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface Conductor {
  id: string
  nombres: string
  apellido_paterno: string
  rut: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: "uploading" | "completed" | "error" | "analyzing"
  error?: string
  documentType?: string
  conductorId?: string
}

export function DocumentosUpload({ conductores, onUploadSuccess }: { conductores: Conductor[], onUploadSuccess?: () => void }) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [selectedConductor, setSelectedConductor] = useState<string>(conductores[0]?.id || "")
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedConductor && !conductores[0]) {
        alert("No hay conductores disponibles")
        return
      }

      const conductorToUse = selectedConductor || conductores[0]?.id
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "analyzing" as const,
        conductorId: conductorToUse,
      }))

      setFiles((prev) => [...prev, ...newFiles])
      setIsUploading(true)

      for (const uploadFile of newFiles) {
        try {
          // Step 1: Detect document type
          const formData = new FormData()
          formData.append("file", uploadFile.file)
          formData.append("conductor_id", conductorToUse)

          const detectResponse = await fetch("/api/detect-document-type", {
            method: "POST",
            body: formData,
          })

          if (!detectResponse.ok) {
            throw new Error("Error detecting document type")
          }

          const detectData = await detectResponse.json()
          const documentType = detectData.document_type_id || "unknown"
          const documentCode = detectData.codigo_documento || `DOC_${Date.now()}`

          // Update file with detected type
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "uploading",
                    progress: 30,
                    documentType: documentCode,
                  }
                : f
            )
          )

          // Step 2: Generate standardized filename
          const conductor = conductores.find((c) => c.id === selectedConductor)
          const timestamp = new Date().toISOString().split("T")[0]
          const fileExt = uploadFile.file.name.split(".").pop()
          const standardizedName = `${documentCode}_${conductor?.rut}_${timestamp}.${fileExt}`

          // Step 3: Upload file with standardized name
          const uploadData = new FormData()
          uploadData.append("file", uploadFile.file)
          uploadData.append("conductor_id", selectedConductor)
          uploadData.append("document_type_id", documentType)
          uploadData.append("filename", standardizedName)
          uploadData.append("original_filename", uploadFile.file.name)

          const uploadResponse = await fetch("/api/company/documents/upload", {
            method: "POST",
            body: uploadData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Error uploading file")
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "completed",
                    progress: 100,
                  }
                : f
            )
          )
          
          // Call success callback
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                  }
                : f
            )
          )
        }
      }

      setIsUploading(false)
    },
    [selectedConductor, conductores]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !selectedConductor || isUploading,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-muted-foreground hover:border-primary`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-medium text-base">
          {isDragActive ? "Suelta los documentos aquí" : "Arrastra documentos aquí o haz click"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Soporta PDF, imágenes y documentos office
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Documentos</h3>
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{file.file.name}</p>
                    {file.documentType && (
                      <p className="text-xs text-muted-foreground">
                        Código: {file.documentType}
                      </p>
                    )}
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                    <Progress value={file.progress} className="mt-2 h-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "completed" && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    {(file.status === "uploading" || file.status === "analyzing") && (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                    )}
                    {file.status !== "uploading" && file.status !== "analyzing" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
