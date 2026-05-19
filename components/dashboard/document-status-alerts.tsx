"use client"

import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

interface DocumentStatusAlertsProps {
  stats: {
    pendientes: number
    aprobados: number
    rechazados: number
  }
}

export function DocumentStatusAlerts({ stats }: DocumentStatusAlertsProps) {
  const alerts = []

  if (stats.pendientes > 0) {
    alerts.push({
      id: "pending",
      type: "pending",
      icon: Clock,
      title: `${stats.pendientes} Documento${stats.pendientes !== 1 ? 's' : ''} Pendiente${stats.pendientes !== 1 ? 's' : ''}`,
      message: "Hay documentos en revisión esperando validación",
      color: "bg-amber-500/10 border-amber-500/30",
      textColor: "text-amber-400",
      href: "/dashboard/company/documentos/pendientes"
    })
  }

  if (stats.rechazados > 0) {
    alerts.push({
      id: "rejected",
      type: "rejected",
      icon: AlertTriangle,
      title: `${stats.rechazados} Documento${stats.rechazados !== 1 ? 's' : ''} Rechazado${stats.rechazados !== 1 ? 's' : ''}`,
      message: "Algunos documentos no pasaron la validación y requieren revisión",
      color: "bg-red-500/10 border-red-500/30",
      textColor: "text-red-400",
      href: "/dashboard/company/documentos/rechazados"
    })
  }

  if (stats.aprobados > 0) {
    alerts.push({
      id: "approved",
      type: "approved",
      icon: CheckCircle,
      title: `${stats.aprobados} Documento${stats.aprobados !== 1 ? 's' : ''} Aprobado${stats.aprobados !== 1 ? 's' : ''}`,
      message: "Documentos validados exitosamente",
      color: "bg-green-500/10 border-green-500/30",
      textColor: "text-green-400",
      href: "/dashboard/company/documentos/aprobados"
    })
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Estado de Documentos</h2>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert) => {
          const Icon = alert.icon
          return (
            <a
              key={alert.id}
              href={alert.href}
              className={`p-4 rounded-lg border ${alert.color} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${alert.textColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${alert.textColor} text-sm`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
