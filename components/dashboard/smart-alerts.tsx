"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Clock, CheckCircle, Calendar, Truck, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartAlert {
  id: string
  type: "expiry" | "renewal" | "compliance" | "maintenance"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  daysUntil: number
  documentType: string
  vehicleId?: string
  driverName?: string
  actionRequired: string
  createdAt: Date
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch real alerts from API
        const res = await fetch(`/api/alerts?limit=20&_t=${Date.now()}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Error al cargar alertas")
        
        const data = await res.json()
        const alertsList = Array.isArray(data) ? data : data?.alerts || []
        
        // Transform API alerts to SmartAlert format
        const transformedAlerts: SmartAlert[] = alertsList.map((alert: any) => {
          // Normalize priority - API returns critical/high/medium/low, component expects high/medium/low
          let normalizedPriority: 'high' | 'medium' | 'low' = 'medium'
          if (alert.priority === 'critical' || alert.priority === 'high') {
            normalizedPriority = 'high'
          } else if (alert.priority === 'medium') {
            normalizedPriority = 'medium'
          } else {
            normalizedPriority = 'low'
          }

          return {
            id: alert.id,
            type: alert.type === 'DOCUMENT_REJECTED' || alert.type === 'error' ? 'expiry' : 
                   alert.type === 'DOCUMENT_APPROVED' || alert.type === 'success' ? 'compliance' : 
                   alert.type === 'DOCUMENT_PENDING' || alert.type === 'info' ? 'renewal' : 'maintenance',
            priority: normalizedPriority,
            title: alert.title || 'Alerta del sistema',
            description: alert.message || alert.description || '',
            daysUntil: 0,
            documentType: alert.document_type || 'Documento',
            driverName: alert.entity_name || alert.ejecutiva_asignada,
            actionRequired: `Revisar: ${alert.title || 'Documento'}`,
            createdAt: new Date(alert.created_at),
          }
        })
        
        setAlerts(transformedAlerts)
      } catch (error) {
        console.error('[v0] Error loading smart alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const filteredAlerts = alerts.filter((alert) => filter === "all" || alert.priority === filter)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expiry":
        return <Clock className="h-4 w-4" />
      case "renewal":
        return <Calendar className="h-4 w-4" />
      case "compliance":
        return <AlertTriangle className="h-4 w-4" />
      case "maintenance":
        return <Truck className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const markAsResolved = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600" />
          Alertas Inteligentes
        </CardTitle>
        <CardDescription>Sistema de alertas predictivo basado en IA para gestión proactiva</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "high", "medium", "low"] as const).map((priority) => (
              <Button
                key={priority}
                variant={filter === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(priority)}
                className="capitalize"
              >
                {priority === "all" ? "Todas" : priority === "high" ? "Alta" : priority === "medium" ? "Media" : "Baja"}
                {priority !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {alerts.filter((a) => a.priority === priority).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Alerts list */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No hay alertas para mostrar</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border-l-4 bg-card",
                    alert.priority === "high"
                      ? "border-l-red-500"
                      : alert.priority === "medium"
                        ? "border-l-yellow-500"
                        : "border-l-blue-500",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority === "high" ? "Alta" : alert.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{alert.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.vehicleId && (
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {alert.vehicleId}
                          </span>
                        )}
                        {alert.driverName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.driverName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {alert.documentType}
                        </span>
                      </div>

                      <div className="bg-muted p-2 rounded text-sm">
                        <strong>Acción requerida:</strong> {alert.actionRequired}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-lg font-bold",
                            alert.daysUntil <= 7
                              ? "text-red-600"
                              : alert.daysUntil <= 30
                                ? "text-yellow-600"
                                : "text-blue-600",
                          )}
                        >
                          {alert.daysUntil}
                        </div>
                        <div className="text-xs text-muted-foreground">días</div>
                      </div>

                      <Button size="sm" variant="outline" onClick={() => markAsResolved(alert.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolver
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
