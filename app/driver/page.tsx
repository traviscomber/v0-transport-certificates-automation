import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle, Calendar, Upload, Download, User } from "lucide-react"

export default async function DriverPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    redirect("/auth/login")
  }

  if (!profile || profile.role !== "driver") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Mi Dashboard de Conductor</h1>
          <p className="text-muted-foreground">Gestiona tus certificados y documentos</p>
        </div>

        {/* User Info */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 rounded-full">
                <User className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-foreground">{profile?.full_name || "Conductor"}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Certificados Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">3</div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Verificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">3</div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-foreground">Mis Certificados</CardTitle>
                <CardDescription className="text-muted-foreground">Tus documentos y certificaciones</CardDescription>
              </div>
              <Button className="btn-orange">
                <Upload className="w-4 h-4 mr-2" />
                Subir Documento
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Licencia de Conducir", status: "Verificado", expiry: "2025-12-31", icon: FileText },
              { name: "Certificado Ley 20.123", status: "Verificado", expiry: "2025-06-15", icon: CheckCircle },
              { name: "Certificado de Antecedentes", status: "Verificado", expiry: "2024-09-20", icon: CheckCircle },
            ].map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-slate-900/50 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <cert.icon className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium text-foreground">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">Vence: {cert.expiry}</div>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/50">
                  {cert.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">Notificaciones</CardTitle>
            <CardDescription className="text-muted-foreground">Actualizaciones importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/30">
              <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Recordatorio: Licencia por vencer</p>
                <p className="text-sm text-muted-foreground">Tu licencia vence en 120 días. Renuévala antes de que expire.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Documentos aprobados</p>
                <p className="text-sm text-muted-foreground">Tu certificado de antecedentes fue verificado correctamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
