import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleManagement } from "@/components/admin/role-management"

export default function RolesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Roles</h1>
        <p className="text-muted-foreground">Control de acceso y permisos del sistema con datos reales del entorno</p>
      </div>

      <RoleManagement currentUserRole="administrador" />

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Asignación de roles</CardTitle>
          <CardDescription className="text-muted-foreground">
            La tabla de usuarios se carga desde el backend operativo. Si no hay usuarios visibles, el sistema está devolviendo un conjunto vacío real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm text-slate-300">
            La asignación se maneja desde las acciones del sistema y no desde datos de ejemplo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
