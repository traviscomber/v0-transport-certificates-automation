import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Truck, FileText, AlertTriangle, CheckCircle } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Check user authentication
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  // Get user profile (optional for demo)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle()
  
  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground">Bienvenido al dashboard administrativo</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Conductores Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">12</div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Transportistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">5</div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Cumplido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">9</div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">3</div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">34</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="text-foreground">Actividad Reciente</CardTitle>
              <CardDescription className="text-muted-foreground">Últimas actualizaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { user: "Juan Rodríguez", action: "Subió licencia", time: "Hace 2 horas" },
                { user: "Carlos López", action: "Actualizo certificado", time: "Hace 5 horas" },
                { user: "María García", action: "Renovó documentos", time: "Hace 1 día" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-slate-900/50 rounded border border-slate-700/30">
                  <div>
                    <p className="font-medium text-foreground">{item.user}</p>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                  </div>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="text-foreground">Estado de Cumplimiento</CardTitle>
              <CardDescription className="text-muted-foreground">Resumen por transportista</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Trans Rodríguez", status: "Cumplido", color: "text-green-400" },
                { name: "Flete López", status: "Pendiente", color: "text-orange-400" },
                { name: "Transportes García", status: "Cumplido", color: "text-green-400" },
                { name: "Distribuidora Central", status: "Pendiente", color: "text-orange-400" },
                { name: "Logística Norte", status: "Cumplido", color: "text-green-400" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700/30">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
