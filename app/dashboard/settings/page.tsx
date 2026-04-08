import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestiona la configuración del sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
            <CardDescription>Esta página está en desarrollo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La página de configuración avanzada estará disponible próximamente con todas las opciones de administración del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
