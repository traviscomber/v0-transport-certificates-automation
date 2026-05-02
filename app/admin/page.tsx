import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Truck, FileText, AlertTriangle, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground">Bienvenido al dashboard administrativo</p>
        </div>

        {/* Empty State */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-slate-300">Sin datos disponibles</CardTitle>
              <CardDescription className="text-slate-400">
                Los datos se mostrarán aquí cuando haya registros en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                El dashboard se poblará automáticamente con métricas y estadísticas cuando se registren conductores, documentos y empresas en el sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
