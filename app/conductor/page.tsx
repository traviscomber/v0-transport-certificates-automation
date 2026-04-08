import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function ConductorDashboard() {
  const supabase = await createClient()

  const documentos = [
    {
      id: "1",
      tipo: "Licencia A4",
      estado: "vigente",
      vencimiento: "2025-08-20",
      diasRestantes: 152,
    },
    {
      id: "2",
      tipo: "Certificado Ley 20.123",
      estado: "vigente",
      vencimiento: "2025-05-10",
      diasRestantes: 50,
    },
    {
      id: "3",
      tipo: "Primeros Auxilios",
      estado: "vencido",
      vencimiento: "2024-01-15",
      diasRestantes: -67,
    },
    {
      id: "4",
      tipo: "Examen Toxicológico",
      estado: "vigente",
      vencimiento: "2024-12-01",
      diasRestantes: 255,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#18181B]">Mi Perfil</h1>
        <p className="text-[#71717A] mt-1">Gestiona tu documentación y cumplimiento legal</p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm text-[#71717A]">Nombre</label>
            <div className="text-lg font-medium text-[#18181B]">Juan Carlos García</div>
          </div>
          <div>
            <label className="text-sm text-[#71717A]">RUT</label>
            <div className="text-lg font-medium text-[#18181B]">12.345.678-9</div>
          </div>
          <div>
            <label className="text-sm text-[#71717A]">Email</label>
            <div className="text-lg font-medium text-[#18181B]">juan.garcia@email.com</div>
          </div>
          <div>
            <label className="text-sm text-[#71717A]">Transportista Asociado</label>
            <div className="text-lg font-medium text-[#18181B]">Transportes García SPA</div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Documentos</CardTitle>
              <CardDescription>Estado de cumplimiento de documentación</CardDescription>
            </div>
            <Link href="/conductor/documentos">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-4"
              >
                <div className="flex-1">
                  <div className="font-medium text-[#18181B]">{doc.tipo}</div>
                  <div className="text-sm text-[#71717A]">
                    Vencimiento: {doc.vencimiento}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    {doc.estado === "vigente" && (
                      <div className="text-green-600">
                        {doc.diasRestantes} días
                      </div>
                    )}
                    {doc.estado === "vencido" && (
                      <div className="text-red-600">
                        Vencido hace {Math.abs(doc.diasRestantes)} días
                      </div>
                    )}
                  </div>
                  <Badge
                    className={
                      doc.estado === "vigente"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {doc.estado === "vigente" ? "Vigente" : "Vencido"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Alertas Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Tu certificado de Primeros Auxilios venció hace 67 días
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <Calendar className="h-4 w-4" />
              Tu Licencia A4 vence en 152 días
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <Calendar className="h-4 w-4" />
              Tu Certificado Ley 20.123 vence en 50 días
            </li>
          </ul>
          <Link href="/conductor/documentos">
            <Button className="mt-4 w-full bg-red-600 text-white hover:bg-red-700">
              Renovar Documentación
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo renovar tus documentos?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 list-decimal list-inside text-[#71717A]">
            <li>Obtén el documento renovado del organismo correspondiente</li>
            <li>Sube el documento en la sección "Mis Documentos"</li>
            <li>Espera la validación automática (2-4 horas)</li>
            <li>Recibirás notificación cuando se apruebe</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
