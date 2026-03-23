'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Grid3x3, Eye } from "lucide-react"
import Image from "next/image"

interface DocumentRef {
  id: string
  name: string
  category: string
  image: string
  description: string
}

const DOCUMENT_REFERENCES: DocumentRef[] = [
  { id: '01', name: 'Licencia A4', category: 'Conductor', image: '/document-examples/01-licencia-conduccion-a4.jpg', description: 'Licencia de conducción categoría A4' },
  { id: '02', name: 'RTV', category: 'Vehículo', image: '/document-examples/02-rtv-revision-tecnica.jpg', description: 'Revisión técnica vehicular' },
  { id: '03', name: 'Tarjeta Circulación', category: 'Vehículo', image: '/document-examples/03-tarjeta-circulacion.jpg', description: 'Tarjeta de circulación' },
  { id: '04', name: 'RUT', category: 'Identidad', image: '/document-examples/04-rut-certificate.jpg', description: 'Certificado de RUT' },
  { id: '05', name: 'Seguro RC', category: 'Vehículo', image: '/document-examples/05-seguro-rc.jpg', description: 'Seguro responsabilidad civil' },
  { id: '06', name: 'Permiso Circulación', category: 'Vehículo', image: '/document-examples/06-permiso-circulacion.jpg', description: 'Permiso de circulación mensual' },
  { id: '07', name: 'Ley 20.123', category: 'Cumplimiento', image: '/document-examples/07-ley-20123-capacitacion.jpg', description: 'Capacitación Ley 20.123' },
  { id: '08', name: 'ADR', category: 'Especializado', image: '/document-examples/08-adr-certificate.jpg', description: 'Certificado ADR' },
]

export function DocumentReferenceGallery() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-[#18181B] flex items-center gap-2">
          <Grid3x3 className="w-6 h-6" />
          Ejemplos de Documentos
        </h3>
        <p className="text-[#71717A]">Consulta los documentos que necesitas subir. Haz clic en cualquiera para ampliar.</p>
      </div>

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
