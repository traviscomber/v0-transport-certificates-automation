import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { SmartAlerts } from "./smart-alerts"

export function DashboardOverview() {
  const stats = [
    {
      title: "Certificados F-30",
      value: "24",
      description: "Documentos activos",
      icon: FileText,
      status: "active",
    },
    {
      title: "Certificados F-30-1",
      value: "18",
      description: "Documentos activos",
      icon: Shield,
      status: "active",
    },
    {
      title: "Documentos de Máquinas",
      value: "42",
      description: "Permisos y licencias",
      icon: Truck,
      status: "active",
    },
    {
      title: "Documentos Vencidos",
      value: "3",
      description: "Requieren renovación",
      icon: AlertTriangle,
      status: "warning",
    },
  ]

  const recentDocuments = [
    {
      id: 1,
      type: "F-30",
      transporter: "Transportes González Ltda.",
      status: "approved",
      date: "2024-01-15",
      expiryDate: "2024-07-15",
    },
    {
      id: 2,
      type: "F-30-1",
      transporter: "Logística del Sur S.A.",
      status: "pending",
      date: "2024-01-14",
      expiryDate: "2024-06-14",
    },
    {
      id: 3,
      type: "Permiso Circulación",
      transporter: "Transportes Rápidos Chile",
      status: "expired",
      date: "2023-12-01",
      expiryDate: "2024-01-01",
    },
    {
      id: 4,
      type: "Licencia Conducir",
      transporter: "Distribuidora Norte",
      status: "approved",
      date: "2024-01-10",
      expiryDate: "2025-01-10",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Aprobado
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">Gestión inteligente de certificados y documentos de transporte</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.status === "warning" ? "text-yellow-600" : "text-primary"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SmartAlerts />

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Recientes</CardTitle>
          <CardDescription>Últimos documentos procesados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground">{doc.transporter}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">Vence: {doc.expiryDate}</p>
                    <p className="text-xs text-muted-foreground">Subido: {doc.date}</p>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
