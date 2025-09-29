import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values: any
  new_values: any
  ip_address: string
  user_agent: string
  created_at: string
}

interface AuditLogTableProps {
  auditLog: AuditLogEntry[]
}

export function AuditLogTable({ auditLog }: AuditLogTableProps) {
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "insert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Registro de Auditoría
        </CardTitle>
        <CardDescription>Historial de actividades del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {auditLog.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay registros de auditoría</h3>
            <p className="text-muted-foreground">Las actividades del sistema aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Acción</th>
                  <th className="p-4 font-medium">Tabla</th>
                  <th className="p-4 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <span className="text-sm">{new Date(entry.created_at).toLocaleString("es-CL")}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono">{entry.user_id?.substring(0, 8)}...</span>
                    </td>
                    <td className="p-4">
                      <Badge className={getActionColor(entry.action)}>{entry.action}</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{entry.table_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono">{entry.ip_address || "N/A"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
