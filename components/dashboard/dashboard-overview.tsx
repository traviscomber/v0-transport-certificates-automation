"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { SmartAlerts } from "./smart-alerts"

interface Alert {
  id: string
  type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  is_dismissed: boolean
  created_at: string
  metadata?: Record<string, any>
}

export function DashboardOverview() {
  const [stats, setStats] = useState([
    {
      title: "Total de Documentos",
      value: "0",
      description: "En el sistema",
      icon: FileText,
      status: "active",
    },
    {
      title: "Documentos Aprobados",
      value: "0",
      description: "Validados",
      icon: CheckCircle,
      status: "active",
    },
    {
      title: "Documentos Pendientes",
      value: "0",
      description: "En revisión",
      icon: Clock,
      status: "active",
    },
    {
      title: "Documentos Vencidos",
      value: "0",
      description: "Requieren renovación",
      icon: AlertTriangle,
      status: "warning",
    },
  ])

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alerts - now getting more alerts to show in dashboard
        const alertsRes = await fetch(`/api/alerts?limit=50&_t=${Date.now()}`, {
          cache: "no-store",
        })
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          // Handle both array and object with alerts property
          const alertsList = Array.isArray(alertsData) ? alertsData : (alertsData.alerts || [])
          setAlerts(alertsList)

          // Calculate stats from alerts
          const approved = alertsList.filter((a: Alert) => a.type === 'DOCUMENT_APPROVED').length
          const pending = alertsList.filter((a: Alert) => a.type === 'DOCUMENT_PENDING').length
          const rejected = alertsList.filter((a: Alert) => a.type === 'DOCUMENT_REJECTED').length
          const total = alertsList.length

          setStats([
            {
              title: "Total de Documentos",
              value: total.toString(),
              description: "En el sistema",
              icon: FileText,
              status: "active",
            },
            {
              title: "Documentos Aprobados",
              value: approved.toString(),
              description: "Validados",
              icon: CheckCircle,
              status: "active",
            },
            {
              title: "Documentos Pendientes",
              value: pending.toString(),
              description: "En revisión",
              icon: Clock,
              status: "active",
            },
            {
              title: "Documentos Rechazados",
              value: rejected.toString(),
              description: "No validados",
              icon: AlertTriangle,
              status: "warning",
            },
          ])
        }
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (type: string) => {
    switch (type) {
      case "DOCUMENT_APPROVED":
        return (
          <Badge variant="default" className="bg-green-600 text-white border border-green-600 hover:bg-green-700">
            Aprobado
          </Badge>
        )
      case "DOCUMENT_PENDING":
        return <Badge variant="secondary" className="bg-yellow-200 text-black hover:bg-yellow-200">Pendiente</Badge>
      case "DOCUMENT_REJECTED":
        return <Badge variant="destructive" className="bg-red-500 text-black hover:bg-red-600">Rechazado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT_APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "DOCUMENT_PENDING":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "DOCUMENT_REJECTED":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
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

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recientes</CardTitle>
            <CardDescription>Últimas alertas del sistema - {alerts.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">{getStatusIcon(alert.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">{getStatusBadge(alert.type)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
