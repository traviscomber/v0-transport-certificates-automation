"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  const { onSync } = useDocumentSync()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alerts for display - with cache busting
        const alertsRes = await fetch(`/api/alerts?limit=50&_t=${Date.now()}`, {
          cache: "no-store",
        })
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          const alertsList = Array.isArray(alertsData) ? alertsData : (alertsData.alerts || [])
          console.log('[v0] Dashboard: Loaded alerts:', alertsList.length)
          setAlerts(alertsList)
        }

        // Fetch REAL document stats from the database
        // Query all documents without filtering by driver_id since dashboard needs all documents
        const docsRes = await fetch(`/api/company/documents/all?_t=${Date.now()}`, {
          cache: "no-store",
        })
        
        let total = 0, approved = 0, pending = 0, rejected = 0
        
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          const documents = docsData.documents || []
          
          total = documents.length
          approved = documents.filter((d: any) => 
            d.verification_status === 'aprobado' || d.validation_status === 'approved'
          ).length
          pending = documents.filter((d: any) => 
            d.verification_status === 'pendiente' || d.validation_status === 'pending' || !d.validation_status
          ).length
          rejected = documents.filter((d: any) => 
            d.verification_status === 'rechazado' || d.validation_status === 'rejected'
          ).length
        }

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
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Refresh every 10 seconds to keep alerts up to date
    const intervalId = setInterval(() => {
      console.log('[v0] Dashboard: Auto-refreshing alerts')
      fetchData()
    }, 10000)

    return () => clearInterval(intervalId)
  }, [])

  // Listen for document sync events and refetch dashboard stats
  useEffect(() => {
    const unsubscribe = onSync((event) => {
      console.log('[v0] DashboardOverview: Received sync event', event.type)
      
      // Refetch dashboard stats when documents change
      if (event.type === 'document_uploaded' || event.type === 'document_status_changed') {
        console.log('[v0] DashboardOverview: Refetching stats due to sync event')
        
        const fetchUpdatedStats = async () => {
          try {
            const docsRes = await fetch(`/api/company/documents/all?_t=${Date.now()}`, {
              cache: "no-store",
            })
            
            if (docsRes.ok) {
              const docsData = await docsRes.json()
              const documents = docsData.documents || []
              
              const total = documents.length
              const approved = documents.filter((d: any) => 
                d.verification_status === 'aprobado' || d.validation_status === 'approved'
              ).length
              const pending = documents.filter((d: any) => 
                d.verification_status === 'pendiente' || d.validation_status === 'pending' || !d.validation_status
              ).length
              const rejected = documents.filter((d: any) => 
                d.verification_status === 'rechazado' || d.validation_status === 'rejected'
              ).length

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
            console.error('[v0] DashboardOverview: Error refetching stats:', error)
          }
        }

        fetchUpdatedStats()
      }
    })

    return unsubscribe
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
          <Card key={stat.title} className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all">
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

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Alertas Recientes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimas alertas del sistema - {alerts.length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-orange-500/30 transition-all">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{getStatusIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(alert.type)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
