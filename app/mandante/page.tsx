import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, CheckCircle, Truck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function MandanteDashboard() {
  const supabase = await createClient()

  const stats = {
    transportistas: 12,
    conforme: 10,
    noConforme: 2,
    documentosPendientes: 15,
  }

  const subcontratistas = [
    {
      id: "1",
      razon_social: "Transportes García SPA",
      rut: "76.543.210-1",
      estado: "conforme",
      score: 95,
    },
    {
      id: "2",
      razon_social: "Flete López EIRL",
      rut: "12.345.678-9",
      estado: "conforme",
      score: 88,
    },
    {
      id: "3",
      razon_social: "Trans Rodríguez Ltd",
      rut: "87.654.321-0",
      estado: "noConforme",
      score: 45,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#18181B]">Control de Subcontratistas</h1>
        <p className="text-[#71717A] mt-1">Monitorea el cumplimiento legal de tus subcontratistas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">
              Total Subcontratistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.transportistas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">
              Conforme (Ley 20.123)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.conforme}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">
              No Conforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.noConforme}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">
              Documentos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.documentosPendientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subcontratistas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subcontratistas Registrados</CardTitle>
              <CardDescription>Score de cumplimiento y estado legal</CardDescription>
            </div>
            <Link href="/mandante/subcontratistas">
              <Button className="bg-[#0066FF] text-white hover:bg-[#0052CC]">
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subcontratistas.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-4"
              >
                <div className="flex-1">
                  <div className="font-medium text-[#18181B]">{sub.razon_social}</div>
                  <div className="text-sm text-[#71717A]">RUT: {sub.rut}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#18181B]">{sub.score}</div>
                    <div className="text-xs text-[#71717A]">Score</div>
                  </div>
                  <Badge
                    className={
                      sub.estado === "conforme"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {sub.estado === "conforme" ? "Conforme" : "No Conforme"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Compliance */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Alertas de Compliance</CardTitle>
          <CardDescription>Documentos vencidos o próximos a vencer</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Trans Rodríguez: Licencia conductor vencida
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <TrendingUp className="h-4 w-4" />
              Flete López: Certificado Ley 20.123 vence en 10 días
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <TrendingUp className="h-4 w-4" />
              Transportes García: RTV vehículo vence en 20 días
            </li>
          </ul>
          <Link href="/mandante/compliance">
            <Button className="mt-4 w-full bg-orange-600 text-white hover:bg-orange-700">
              Ver Compliance Detallado
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
