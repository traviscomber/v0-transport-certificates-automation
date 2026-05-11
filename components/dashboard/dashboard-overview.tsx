"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useDocumentSync } from "@/contexts/document-sync-context"

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
  source?: string
  document_type?: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState([
    {
      title: "Total de Documentos",
      value: "0",
      description: "En el sistema",
      icon: FileText,
      status: "active",
      href: "/dashboard/company/documentos",
    },
    {
      title: "Documentos Aprobados",
      value: "0",
      description: "Validados",
      icon: CheckCircle,
      status: "active",
      href: "/dashboard/company/documentos/aprobados",
    },
    {
      title: "Documentos Pendientes",
      value: "0",
      description: "En revisión",
      icon: Clock,
      status: "active",
      href: "/dashboard/company/documentos/pendientes",
    },
    {
      title: "Documentos Vencidos",
      value: "0",
      description: "Requieren renovación",
      icon: AlertTriangle,
      status: "warning",
      href: "/dashboard/company/documentos/rechazados",
    },
  ])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const { onSync } = useDocumentSync()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use consolidated dashboard endpoint (2 API calls → 1)
        const dashboardRes = await fetch(`/api/dashboard?alertLimit=50`, {
          cache: "default",
          headers: { 'Cache-Control': 'max-age=30' }
        })
        
        if (dashboardRes.ok) {
          const data = await dashboardRes.json()
          const { stats: dashboardStats, alerts: alertsList } = data
          const conductorStats = dashboardStats?.conductores || {}
          
          // Update stats cards
          setStats([
            {
              title: "Total de Documentos",
              value: conductorStats.total?.toString() || "0",
              description: "En el sistema",
              icon: FileText,
              status: "active",
              href: "/dashboard/company/documentos",
            },
            {
              title: "Documentos Aprobados",
              value: conductorStats.aprobados?.toString() || "0",
              description: "Validados",
              icon: CheckCircle,
              status: "active",
              href: "/dashboard/company/documentos/aprobados",
            },
            {
              title: "Documentos Pendientes",
              value: conductorStats.pendientes?.toString() || "0",
              description: "En revisión",
              icon: Clock,
              status: "active",
              href: "/dashboard/company/documentos/pendientes",
            },
            {
              title: "Documentos Rechazados",
              value: conductorStats.rechazados?.toString() || "0",
              description: "No validados",
              icon: AlertTriangle,
              status: "warning",
              href: "/dashboard/company/documentos/rechazados",
            },
          ])
          
          // Update alerts
          setAlerts(alertsList || [])
        }
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Refresh every 30 seconds instead of 10 (66% reduction in API calls)
    const intervalId = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Listen for document sync events and refetch dashboard stats
  useEffect(() => {
    const unsubscribe = onSync((event) => {
      // Only refetch on actual document changes, not on every event
      if (event.type === 'document_uploaded' || event.type === 'document_status_changed') {
        
        const fetchUpdatedStats = async () => {
          try {
            // Use consolidated dashboard endpoint for sync updates too
            const dashboardRes = await fetch(`/api/dashboard?alertLimit=50`, {
              cache: "default",
              headers: { 'Cache-Control': 'max-age=30' }
            })
            
            if (dashboardRes.ok) {
              const data = await dashboardRes.json()
              const { stats: dashboardStats, alerts: alertsList } = data
              const conductorStats = dashboardStats?.conductores || {}

              setStats([
                {
                  title: "Total de Documentos",
                  value: conductorStats.total?.toString() || "0",
                  description: "En el sistema",
                  icon: FileText,
                  status: "active",
                  href: "/dashboard/company/documentos",
                },
                {
                  title: "Documentos Aprobados",
                  value: conductorStats.aprobados?.toString() || "0",
                  description: "Validados",
                  icon: CheckCircle,
                  status: "active",
                  href: "/dashboard/company/documentos/aprobados",
                },
                {
                  title: "Documentos Pendientes",
                  value: conductorStats.pendientes?.toString() || "0",
                  description: "En revisión",
                  icon: Clock,
                  status: "active",
                  href: "/dashboard/company/documentos/pendientes",
                },
                {
                  title: "Documentos Rechazados",
                  value: conductorStats.rechazados?.toString() || "0",
                  description: "No validados",
                  icon: AlertTriangle,
                  status: "warning",
                  href: "/dashboard/company/documentos/rechazados",
                },
              ])
              
              setAlerts(alertsList || [])
            }
          } catch (error) {
            console.error('[v0] Error refetching stats:', error)
          }
        }
        
        fetchUpdatedStats()
      }
    })
    
    return () => unsubscribe()
  }, [onSync])

  const getStatusBadge = (type: string) => {
    switch (type) {
      case "DOCUMENT_APPROVED":
        return (
          <Badge variant="default" className="bg-green-600 text-black border border-green-600 hover:bg-green-700">
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

  const getStatIconColor = (title: string): string => {
    if (title.includes("Aprobados")) return "text-green-600"
    if (title.includes("Pendientes")) return "text-yellow-400"
    if (title.includes("Rechazados")) return "text-red-500"
    return "text-primary"
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Control Operacional
          </h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Documentos, conductores, subcontratistas y alertas en tiempo real.
        </p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 transform hover:-translate-y-1"
            onClick={() => stat.href && router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${getStatIconColor(stat.title)}`} />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts - Prominent Section */}
      {alerts.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 col-span-full">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Alertas Recientes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimas alertas del sistema - {alerts.length} total
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/company/alertas')}
              className="ml-auto"
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.slice(0, 15).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-orange-500/30 transition-all cursor-pointer"
                  onClick={() => router.push('/dashboard/company/alertas')}
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{getStatusIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {alert.source === 'document_upload' && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.metadata?.document_type || 'Documento'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(alert.type)}</div>
                </div>
              ))}
            </div>
            {alerts.length > 15 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                + {alerts.length - 15} alertas más
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
