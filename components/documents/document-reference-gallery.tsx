'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Grid3x3, Eye, HelpCircle } from "lucide-react"
import Image from "next/image"
import { QuickHelp } from "@/components/ui/help-box"

interface DocumentRef {
  id: string
  name: string
  category: string
  image: string
  description: string
}

const DOCUMENT_REFERENCES: DocumentRef[] = [
  { id: '01', name: 'Cédula de Identidad (Nuevo 2024)', category: 'Identidad', image: '/document-examples/01-cedula-identidad-nuevo.jpg', description: 'Nueva cédula de identidad chilena con chip, código QR, 32 medidas de seguridad. Diseño con copihue, huemul, cóndor y cordillera de los Andes. Obligatoria para todos.' },
  { id: '02', name: 'Licencia Clase B', category: 'Conductor', image: '/document-examples/02-licencia-conducir-claseb.jpg', description: 'Licencia de conducir clase B para vehículos particulares. Obligatoria para conducir. Vencimiento en cumpleaños del conductor.' },
  { id: '03', name: 'Licencia Clase D', category: 'Conductor', image: '/document-examples/03-licencia-conducir-claseD.jpg', description: 'Licencia de conducir clase D para conductores profesionales de transporte de carga. Requiere capacitación especial.' },
  { id: '04', name: 'Licencia Clase E', category: 'Conductor', image: '/document-examples/04-licencia-conducir-claseE.jpg', description: 'Licencia de conducir clase E para transporte profesional de pasajeros. Requerimientos de salud más estrictos.' },
  { id: '05', name: 'RTV (Revisión Técnica)', category: 'Vehículo', image: '/document-examples/05-rtv-revision-tecnica.jpg', description: 'Certificado de revisión técnica vehicular. Obligatorio anualmente. Verifica estado de frenos, luces, suspensión y más.' },
  { id: '06', name: 'Certificado RUT', category: 'Empresa', image: '/document-examples/06-certificado-rut.jpg', description: 'Certificado de RUT del SII. Formato XX.XXX.XXX-K. Obligatorio para todos. Descargable desde sii.cl' },
  { id: '07', name: 'Tarjeta de Circulación (Verde)', category: 'Vehículo', image: '/document-examples/07-tarjeta-circulacion-verde.jpg', description: 'Tarjeta de circulación anual del MTT. Documento verde que acredita validez del vehículo. Obligatoria tener a bordo.' },
  { id: '08', name: 'Seguro RC (Responsabilidad Civil)', category: 'Vehículo', image: '/document-examples/08-seguro-rc-responsabilidad.jpg', description: 'Póliza de seguro de responsabilidad civil. Obligatorio para todos los vehículos. Cubre daños a terceros.' },
]

export function DocumentReferenceGallery() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-[#18181B] flex items-center gap-2">
          <Grid3x3 className="w-6 h-6" />
          Galeria de Documentos de Ejemplo
        </h3>
        <p className="text-[#71717A]">Aqui puedes ver como se ven los documentos chilenos mas comunes. Usa esta galeria como referencia.</p>
      </div>

      <QuickHelp text="Haz clic en cualquier imagen para verla en grande. Esto te ayudara a identificar si tu documento es del tipo correcto antes de subirlo." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DOCUMENT_REFERENCES.map((doc) => (
          <Dialog key={doc.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer border-[#E4E4E7] hover:border-[#0066FF] hover:shadow-lg transition-all overflow-hidden group">
                <CardContent className="p-0 relative h-48 overflow-hidden bg-[#F4F4F5]">
                  <Image
                    src={doc.image}
                    alt={doc.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-2">
                    <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">{doc.name}</CardTitle>
                      <CardDescription className="text-xs">{doc.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{doc.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative w-full h-96">
                  <Image
                    src={doc.image}
                    alt={doc.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#71717A]">{doc.description}</p>
                  <p className="text-xs text-[#A1A1A6]">Categoría: {doc.category}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
