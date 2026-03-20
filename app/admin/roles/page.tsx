import { RoleManagement } from "@/components/admin/role-management"

export const metadata = {
  title: "Gestión de Roles | DocuFleet",
  description: "Control de acceso y permisos por rol",
}

export default function RolesPage() {
  return (
    <div className="space-y-8">
      <RoleManagement currentUserRole="admin" />
    </div>
  )
}
