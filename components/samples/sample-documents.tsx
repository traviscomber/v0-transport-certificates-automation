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
  imageUrl: string
  mockData: {
    documentType: string
    transporterName: string
    transporterRut: string
    vehiclePlate?: string
    expiryDate: string
    extractedData: Record<string, any>
  }
}

const sampleDocuments: SampleDocument[] = [
  {
    id: "f30-sample",
    name: "Certificado F-30",
    type: "f30",
    description: "Certificado de inscripción en el registro de transportistas",
    icon: FileText,
    imageUrl: "/placeholder.svg?height=400&width=600",
    mockData: {
      documentType: "f30",
      transporterName: "Transportes González Ltda.",
      transporterRut: "76.543.210-9",
      vehiclePlate: "HJKL-34",
      expiryDate: "2024-12-15",
      extractedData: {
        numeroF30: "F30-2024-001234",
        rutTransportista: "76.543.210-9",
        nombreTransportista: "Transportes González Ltda.",
        fechaEmision: "2024-01-15",
        fechaVencimiento: "2024-12-15",
        patenteVehiculo: "HJKL-34",
        tipoVehiculo: "Camión",
        estado: "Vigente",
        observaciones: "Sin restricciones",
      },
    },
  },
  {
    id: "f30-1-sample",
    name: "Certificado F-30-1",
    type: "f30-1",
    description: "Certificado complementario para transporte de carga",
    icon: Shield,
    imageUrl: "/placeholder.svg?height=400&width=600",
    mockData: {
      documentType: "f30-1",
      transporterName: "Logística del Sur S.A.",
      transporterRut: "96.789.123-4",
      vehiclePlate: "MNOP-56",
      expiryDate: "2024-11-30",
      extractedData: {
        numeroF30_1: "F30-1-2024-005678",
        rutTransportista: "96.789.123-4",
        nombreTransportista: "Logística del Sur S.A.",
        fechaEmision: "2024-02-01",
        fechaVencimiento: "2024-11-30",
        patenteVehiculo: "MNOP-56",
        capacidadCarga: "15 toneladas",
        estado: "Vigente",
        observaciones: "Autorizado para carga general",
      },
    },
  },
  {
    id: "permiso-sample",
    name: "Permiso de Circulación",
    type: "permiso-circulacion",
    description: "Permiso municipal de circulación vehicular",
    icon: Truck,
    imageUrl: "/placeholder.svg?height=400&width=600",
    mockData: {
      documentType: "permiso-circulacion",
      transporterName: "Juan Carlos Pérez",
      transporterRut: "12.345.678-9",
      vehiclePlate: "QRST-78",
      expiryDate: "2024-12-31",
      extractedData: {
        patente: "QRST-78",
        rutPropietario: "12.345.678-9",
        nombrePropietario: "Juan Carlos Pérez",
        marcaModelo: "Mercedes-Benz Actros",
        ano: "2020",
        fechaVencimiento: "2024-12-31",
        comuna: "Las Condes",
      },
    },
  },
  {
    id: "licencia-sample",
    name: "Licencia de Conducir",
    type: "licencia-conducir",
    description: "Licencia de conducir profesional clase A4",
    icon: CreditCard,
    imageUrl: "/placeholder.svg?height=250&width=400",
    mockData: {
      documentType: "licencia-conducir",
      transporterName: "María Elena Rodríguez",
      transporterRut: "15.987.654-3",
      expiryDate: "2025-06-20",
      extractedData: {
        rutConductor: "15.987.654-3",
        nombreConductor: "María Elena Rodríguez",
        numeroLicencia: "A4-123456789",
        claseLicencia: "A4 - Profesional",
        fechaEmision: "2023-06-20",
        fechaVencimiento: "2025-06-20",
        restricciones: "Debe usar lentes correctores",
      },
    },
  },
]

export function SampleDocuments() {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  const simulateUpload = async (doc: SampleDocument) => {
    setUploadingDoc(doc.id)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to upload page with pre-filled data
    const params = new URLSearchParams({
      documentType: doc.mockData.documentType,
      transporterName: doc.mockData.transporterName,
      transporterRut: doc.mockData.transporterRut,
      vehiclePlate: doc.mockData.vehiclePlate || "",
      expiryDate: doc.mockData.expiryDate,
      sampleData: JSON.stringify(doc.mockData.extractedData),
    })

    window.location.href = `/dashboard/upload?${params.toString()}`
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
            <Card key={doc.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img src={doc.imageUrl || "/placeholder.svg"} alt={doc.name} className="w-full h-full object-cover" />
                <Badge className="absolute top-2 right-2 bg-primary">Muestra</Badge>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {doc.name}
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transportista:</span>
                    <span className="font-medium">{doc.mockData.transporterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RUT:</span>
                    <span className="font-medium">{doc.mockData.transporterRut}</span>
                  </div>
                  {doc.mockData.vehiclePlate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patente:</span>
                      <span className="font-medium">{doc.mockData.vehiclePlate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vencimiento:</span>
                    <span className="font-medium">{doc.mockData.expiryDate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => window.open(doc.imageUrl, "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ver Documento
                  </Button>

                  <Button size="sm" className="flex-1" onClick={() => simulateUpload(doc)} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Probar OCR
                      </>
                    )}
                  </Button>
                </div>
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
