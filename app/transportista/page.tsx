export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Users, FileText, AlertTriangle, CheckCircle, Clock, Upload, Plus } from "lucide-react"
import Link from "next/link"

export default function TransportistaDashboard() {
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
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Mi Dashboard Transportista</h1>
          <p className="text-muted-foreground">Bienvenido a tu panel de gestión de conductores y vehículos</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300">Conductores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400">{stats.conductores}</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">{stats.vehiculos}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300">Documentos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-400">{stats.documentosPendientes}</div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">{stats.alertasActivas}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Mis Conductores</CardTitle>
                <CardDescription className="text-muted-foreground">Estado de licencias y documentación</CardDescription>
              </div>
              <Link href="/transportista/conductores/nuevo">
                <Button className="btn-orange">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Conductor
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conductores.map((conductor) => (
                <div
                  key={conductor.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {conductor.nombres} {conductor.apellido}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Licencia: {conductor.licencia} | Vencimiento: {conductor.vencimiento}
                    </div>
                  </div>
                  <Badge
                    className={
                      conductor.estado === "vigente"
                        ? "bg-green-500/30 text-green-200 border border-green-500/50"
                        : "bg-red-500/30 text-red-200 border border-red-500/50"
                    }
                  >
                    {conductor.estado === "vigente" ? "✓ Vigente" : "✗ Vencida"}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/transportista/conductores">
              <Button variant="outline" className="mt-4 w-full border-slate-600 hover:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Ver Todos los Conductores
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Mis Vehículos</CardTitle>
                <CardDescription className="text-muted-foreground">Estado de RTV y permisos de circulación</CardDescription>
              </div>
              <Link href="/transportista/vehiculos/nuevo">
                <Button className="btn-orange">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Vehículo
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehiculos.map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{vehiculo.patente}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehiculo.tipo} | RTV: {vehiculo.rtv} | Permiso: {vehiculo.permiso}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {vehiculo.rtv === "vencida" && (
                      <Badge className="bg-red-500/30 text-red-200 border border-red-500/50">RTV Vencida</Badge>
                    )}
                    {vehiculo.rtv === "vigente" && (
                      <Badge className="bg-green-500/30 text-green-200 border border-green-500/50">✓ RTV Ok</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/transportista/vehiculos">
              <Button variant="outline" className="mt-4 w-full border-slate-600 hover:bg-slate-700">
                <Truck className="w-4 h-4 mr-2" />
                Ver Todos los Vehículos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-red-300">Alertas Importantes</CardTitle>
            <CardDescription className="text-muted-foreground">Tienes documentos vencidos o próximos a vencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Licencia de Carlos López vencida</div>
                  <div className="text-sm text-muted-foreground">Vencida desde 2024-03-10</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">RTV vehículo WXYZ-34 vencida</div>
                  <div className="text-sm text-muted-foreground">Requiere revisión técnica urgente</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Licencia Juan García vence en 75 días</div>
                  <div className="text-sm text-muted-foreground">Renovar próximamente</div>
                </div>
              </div>
            </div>
            <Link href="/transportista/alertas">
              <Button className="w-full btn-orange">
                <FileText className="w-4 h-4 mr-2" />
                Ver Todas las Alertas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader>
              <Upload className="w-8 h-8 text-orange-400 mb-2" />
              <CardTitle className="text-foreground">Subir Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Sube documentos de conductores y vehículos</p>
              <Link href="/transportista/upload">
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Ir a Carga
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-foreground">Estado de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Revisa el estado de tus documentos</p>
              <Link href="/transportista/documentos">
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Ver Estado
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
