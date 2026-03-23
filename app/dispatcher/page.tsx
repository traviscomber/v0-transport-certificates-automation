import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Users, FileText, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"

export default function DispatcherPage() {
  // Demo data - no authentication needed
  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Panel de Despacho</h1>
          <p className="text-muted-foreground">Gestiona tus conductores y verificación de cumplimiento</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Conductores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">8</div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Cumpliendo Norma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">7</div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300">Documentos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">2</div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Por Revisar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-foreground">Conductores</CardTitle>
                <CardDescription className="text-muted-foreground">Estado de compliance de tus conductores</CardDescription>
              </div>
              <Button className="btn-orange">
                <Users className="w-4 h-4 mr-2" />
                Agregar Conductor
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Juan Rodríguez", license: "12.345.678", status: "Conforme", score: 95 },
              { name: "Carlos López", license: "11.234.567", status: "Conforme", score: 88 },
              { name: "María García", license: "10.123.456", status: "Pendiente", score: 72 },
              { name: "Pedro Martínez", license: "9.987.654", status: "Conforme", score: 91 },
              { name: "Ana Fernández", license: "8.876.543", status: "Conforme", score: 85 },
            ].map((driver, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-slate-900/50 hover:border-slate-600 transition-all">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{driver.name}</div>
                  <div className="text-sm text-muted-foreground">RUT: {driver.license}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{driver.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <Badge className={driver.status === "Conforme" ? "bg-green-500/20 text-green-300 border border-green-500/50" : "bg-orange-500/20 text-orange-300 border border-orange-500/50"}>
                    {driver.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-orange-300">Alertas de Compliance</CardTitle>
            <CardDescription className="text-muted-foreground">Documentos vencidos o próximos a vencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-foreground">María García: Licencia vencida</p>
                <p className="text-sm text-muted-foreground">Requiere acción inmediata</p>
              </div>
              <Button size="sm" className="btn-orange">Revisar</Button>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded border border-orange-500/30">
              <FileText className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Carlos López: Certificado Ley 20.123 vence en 15 días</p>
                <p className="text-sm text-muted-foreground">Agendar renovación</p>
              </div>
              <Button size="sm" variant="outline">Agendar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: BarChart3, title: "Reportes", desc: "Genera reportes de compliance" },
            { icon: FileText, title: "Validaciones", desc: "Revisa documentos pendientes" },
            { icon: Truck, title: "Conductores", desc: "Gestiona tu equipo" },
          ].map((action, idx) => (
            <Card key={idx} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all cursor-pointer">
              <CardHeader>
                <action.icon className="w-8 h-8 text-cyan-400 mb-2" />
                <CardTitle className="text-foreground">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{action.desc}</p>
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
