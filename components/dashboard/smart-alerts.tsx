"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Clock, CheckCircle, Calendar, Truck, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartAlert {
  id: string
  type: "expiring_soon" | "expired" | "pending_review" | "rejected"
  priority: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  daysUntilExpiry?: number
  documentId: string
  conductorName: string
  documentType: string
  transportistaName: string
  ejecutiva: string
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch smart alerts from new endpoint
        const res = await fetch(`/api/company/smart-alerts?_t=${Date.now()}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Error al cargar alertas inteligentes")
        
        const data = await res.json()
        setAlerts(data || [])
      } catch (error) {
        console.error('[v0] Error loading smart alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const filteredAlerts = alerts.filter((alert) => filter === "all" || alert.priority === filter)

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
            {(["all", "critical", "high", "medium", "low"] as const).map((priority) => (
              <Button
                key={priority}
                variant={filter === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(priority as any)}
                className="capitalize"
              >
                {priority === "all" ? "Todas" : priority === "critical" ? "Crítica" : priority === "high" ? "Alta" : priority === "medium" ? "Media" : "Baja"}
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
                    alert.priority === "critical"
                      ? "border-l-red-600"
                      : alert.priority === "high"
                        ? "border-l-orange-500"
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
                          {alert.priority === "critical" ? "CRÍTICA" : alert.priority === "high" ? "ALTA" : alert.priority === "medium" ? "MEDIA" : "BAJA"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{alert.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.conductorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {alert.transportistaName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {alert.documentType}
                        </span>
                      </div>

                      <div className="bg-muted p-2 rounded text-sm">
                        <strong>Ejecutiva:</strong> {alert.ejecutiva}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {alert.daysUntilExpiry !== undefined && (
                        <div className="text-right">
                          <div
                            className={cn(
                              "text-lg font-bold",
                              alert.daysUntilExpiry <= 7
                                ? "text-red-600"
                                : alert.daysUntilExpiry <= 30
                                  ? "text-yellow-600"
                                  : "text-blue-600",
                            )}
                          >
                            {alert.daysUntilExpiry}
                          </div>
                          <div className="text-xs text-muted-foreground">días</div>
                        </div>
                      )}

                      <Button size="sm" variant="outline" onClick={() => markAsResolved(alert.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Revisar
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
