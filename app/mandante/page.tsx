export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, CheckCircle, Truck, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

export default function MandanteDashboard() {
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
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Control de Transportistas</h1>
          <p className="text-muted-foreground">Monitorea el cumplimiento legal de tus transportistas y sub-contratistas</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Transportistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{stats.transportistas}</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">
                Conforme (Ley 20.123)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">{stats.conforme}</div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">
                No Conforme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">{stats.noConforme}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300">
                Documentos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-400">{stats.documentosPendientes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transportistas */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Transportistas Registrados</CardTitle>
                <CardDescription className="text-muted-foreground">Score de cumplimiento y estado legal</CardDescription>
              </div>
              <Link href="/mandante/transportistas">
                <Button className="btn-orange">
                  <Truck className="w-4 h-4 mr-2" />
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
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{sub.razon_social}</div>
                    <div className="text-sm text-muted-foreground">RUT: {sub.rut}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{sub.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <Badge
                      className={
                        sub.estado === "conforme"
                          ? "bg-green-500/30 text-green-200 border border-green-500/50"
                          : "bg-red-500/30 text-red-200 border border-red-500/50"
                      }
                    >
                      {sub.estado === "conforme" ? "✓ Conforme" : "✗ No Conforme"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Compliance */}
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-orange-300">Alertas de Compliance</CardTitle>
            <CardDescription className="text-muted-foreground">Documentos vencidos o próximos a vencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Trans Rodríguez: Licencia conductor vencida</div>
                  <div className="text-sm text-muted-foreground">Requiere acción inmediata</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Flete López: Certificado Ley 20.123 vence en 10 días</div>
                  <div className="text-sm text-muted-foreground">Renovar próximamente</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Transportes García: RTV vehículo vence en 20 días</div>
                  <div className="text-sm text-muted-foreground">Programar revisión técnica</div>
                </div>
              </div>
            </div>
            <Link href="/mandante/alertas">
              <Button className="w-full btn-orange">
                <FileText className="w-4 h-4 mr-2" />
                Ver Compliance Detallado
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-foreground">Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Genera reportes de compliance para auditorías</p>
              <Link href="/mandante/reportes">
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Ver Reportes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-foreground">Validaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Revisa documentos enviados por tus transportistas</p>
              <Link href="/mandante/validaciones">
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Revisar Documentos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader>
              <Truck className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-foreground">Transportistas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Gestiona transportistas y sus datos</p>
              <Link href="/mandante/transportistas">
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Gestionar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
