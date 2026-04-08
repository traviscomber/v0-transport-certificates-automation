"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, Truck, CreditCard, Download, Upload, Brain } from "lucide-react"
import { useState } from "react"

interface SampleDocument {
  id: string
  name: string
  type: string
  description: string
  icon: React.ComponentType<any>
}

const sampleDocuments: SampleDocument[] = [
  {
    id: "f30",
    name: "Certificado F-30",
    type: "f30",
    description: "Certificado de inscripción en el registro de transportistas",
    icon: FileText,
  },
  {
    id: "f30-1",
    name: "Certificado F-30-1",
    type: "f30-1",
    description: "Certificado complementario para transporte de carga",
    icon: Shield,
  },
  {
    id: "cedula-identidad",
    name: "Cédula de Identidad",
    type: "cedula-identidad",
    description: "Cédula de identidad chilena",
    icon: CreditCard,
  },
  {
    id: "permiso-circulacion",
    name: "Permiso de Circulación",
    type: "permiso-circulacion",
    description: "Permiso municipal de circulación vehicular",
    icon: Truck,
  },
  {
    id: "licencia-conducir",
    name: "Licencia de Conducir",
    type: "licencia-conducir",
    description: "Licencia de conducir profesional",
    icon: CreditCard,
  },
]

export function SampleDocuments() {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const fileInputRef = { current: null } as React.MutableRefObject<HTMLInputElement | null>

  const handleDocumentSelect = (doc: SampleDocument) => {
    // Create a hidden file input for each document type
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploadingDoc(doc.id)

      try {
        // Send file to the analyze-document API
        const formData = new FormData()
        formData.append("file", file)
        formData.append("documentType", doc.type)

        const response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error al procesar documento")
        }

        const result = await response.json()
        console.log("[v0] Document analysis result:", result)

        // Redirect to upload page with actual extracted data
        const params = new URLSearchParams({
          documentType: doc.type,
          extractedData: JSON.stringify(result.extractedData),
          confidence: result.extractedData.confidence || "medium",
        })

        window.location.href = `/dashboard/upload?${params.toString()}`
      } catch (error) {
        console.error("[v0] Error processing document:", error)
        alert("Error al procesar el documento. Intenta de nuevo.")
        setUploadingDoc(null)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Prueba el Sistema OCR
          </CardTitle>
          <CardDescription>
            Utiliza estos documentos de muestra para probar la funcionalidad de análisis automático con IA. Cada
            documento contiene información realista que será extraída automáticamente.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleDocuments.map((doc) => {
          const IconComponent = doc.icon
          const isUploading = uploadingDoc === doc.id

          return (
            <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {doc.name}
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sube una foto de {doc.name.toLowerCase()} para que nuestro sistema extraiga automáticamente los datos usando IA.
                </p>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => handleDocumentSelect(doc)}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir {doc.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">¿Cómo funciona el OCR?</h4>
              <p className="text-sm text-blue-800">
                Nuestro sistema utiliza inteligencia artificial avanzada para analizar automáticamente los documentos y
                extraer información clave como nombres, RUTs, fechas de vencimiento y números de certificados. Esto
                reduce significativamente el tiempo de procesamiento manual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
