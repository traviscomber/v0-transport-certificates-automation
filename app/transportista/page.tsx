import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Users, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function TransportistaDashboard() {
  const supabase = await createClient()

  // Mock data - En producción vendría de la BD
  const stats = {
    conductores: 5,
    vehiculos: 3,
    documentosPendientes: 8,
    alertasActivas: 3,
  }

  const conductores = [
    {
      id: "1",
      nombres: "Juan",
      apellido: "García",
      licencia: "A4",
      estado: "vigente",
      vencimiento: "2025-06-15",
    },
    {
      id: "2",
      nombres: "Carlos",
      apellido: "López",
      licencia: "A5",
      estado: "vencida",
      vencimiento: "2024-03-10",
    },
  ]

  const vehiculos = [
    {
      id: "1",
      patente: "SXYZ-12",
      tipo: "Camión",
      rtv: "vigente",
      permiso: "vigente",
    },
    {
      id: "2",
      patente: "WXYZ-34",
      tipo: "Furgoneta",
      rtv: "vencida",
      permiso: "vigente",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#18181B]">Mi Dashboard</h1>
        <p className="text-[#71717A] mt-1">Bienvenido a tu panel de transportista</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">
              Conductores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.conductores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">
              Vehículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">{stats.vehiculos}</div>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.alertasActivas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conductores */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Conductores</CardTitle>
          <CardDescription>Estado de licencias y documentación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conductores.map((conductor) => (
              <div
                key={conductor.id}
                className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-4"
              >
                <div className="flex-1">
                  <div className="font-medium text-[#18181B]">
                    {conductor.nombres} {conductor.apellido}
                  </div>
                  <div className="text-sm text-[#71717A]">
                    Licencia: {conductor.licencia} | Vencimiento: {conductor.vencimiento}
                  </div>
                </div>
                <Badge
                  className={
                    conductor.estado === "vigente"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {conductor.estado}
                </Badge>
              </div>
            ))}
          </div>
          <Link href="/transportista/conductores">
            <Button className="mt-4 w-full bg-[#0066FF] text-white hover:bg-[#0052CC]">
              Ver Todos los Conductores
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Vehículos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Vehículos</CardTitle>
          <CardDescription>Estado de RTV y permisos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-4"
              >
                <div className="flex-1">
                  <div className="font-medium text-[#18181B]">{vehiculo.patente}</div>
                  <div className="text-sm text-[#71717A]">
                    {vehiculo.tipo} | RTV: {vehiculo.rtv} | Permiso: {vehiculo.permiso}
                  </div>
                </div>
                <div className="flex gap-2">
                  {vehiculo.rtv === "vencida" && (
                    <Badge className="bg-red-100 text-red-800">RTV Vencida</Badge>
                  )}
                  {vehiculo.rtv === "vigente" && (
                    <Badge className="bg-green-100 text-green-800">Ok</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/transportista/vehiculos">
            <Button className="mt-4 w-full bg-[#0066FF] text-white hover:bg-[#0052CC]">
              Ver Todos los Vehículos
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Alertas Importantes</CardTitle>
          <CardDescription>Tienes documentos vencidos o próximos a vencer</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Licencia de Carlos López vencida (2024-03-10)
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <Clock className="h-4 w-4" />
              RTV vehículo WXYZ-34 vencida (próximo a vencer)
            </li>
            <li className="flex items-center gap-3 text-orange-700">
              <Clock className="h-4 w-4" />
              Licencia Juan García vence en 75 días
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
