"use client"

import { useEffect, useState } from "react"
import { Bell, AlertCircle, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Alert {
  id: string
  title: string
  message: string
  severity: "low" | "medium" | "high" | "info"
  status: "active" | "acknowledged" | "resolved"
  created_at: string
  alert_type: string
}

export function AlertsBell() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const supabase = createClient()

    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from("compliance_alerts")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("[v0] Error fetching alerts:", error)
        } else {
          setAlerts(data || [])
          setUnreadCount(data?.length || 0)
        }
      } catch (error) {
        console.error("[v0] Alert fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    // Set up realtime subscription
    const channel = supabase
      .channel("compliance_alerts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "compliance_alerts",
        },
        (payload) => {
          console.log("[v0] Alert change detected:", payload)
          fetchAlerts()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isMounted])

  const handleAcknowledge = async (alertId: string) => {
    try {
      const supabase = createClient()
      // Call acknowledge endpoint instead of direct update
      const response = await fetch("/api/compliance/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alertId })
      })

      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("[v0] Acknowledge error:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-amber-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-l-4 border-l-red-500"
      case "medium":
        return "bg-amber-50 border-l-4 border-l-amber-500"
      case "low":
        return "bg-blue-50 border-l-4 border-l-blue-500"
      default:
        return "bg-gray-50"
    }
  }

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-foreground">Alertas</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadCount} nuevo{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Cargando alertas...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No hay alertas activas
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg text-sm ${getSeverityBgColor(
                      alert.severity
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {alert.severity === "high" ? (
                          <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSeverityColor(alert.severity)}`} />
                        ) : alert.severity === "medium" ? (
                          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSeverityColor(alert.severity)}`} />
                        ) : (
                          <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSeverityColor(alert.severity)}`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString("es-CL")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2 flex-shrink-0 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAcknowledge(alert.id)
                        }}
                      >
                        ✓
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
              <a href="/dashboard/alerts">Ver todas las alertas</a>
            </Button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
