"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useDocumentSync } from "@/contexts/document-sync-context"
import { StatCard } from "./stat-card"
import { AlertItem } from "./alert-item"

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

interface Stat {
  title: string
  value: string
  description: string
  icon: any
  status: "active" | "warning"
  href: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stat[]>([
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
      title: "Documentos Rechazados",
      value: "0",
      description: "No validados",
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
        // Use separate endpoints - more reliable than consolidated endpoint
        const alertsRes = await fetch(`/api/alerts?limit=50`, {
          cache: "default",
        })
        
        const statsRes = await fetch(`/api/company/documents/stats`, {
          cache: "default",
        })

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          const alertsList = Array.isArray(alertsData) ? alertsData : (alertsData.alerts || [])
          setAlerts(alertsList)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          const statsObj = statsData.stats || {}
          const conductorStats = statsObj.conductores || {}
          const subStats = statsObj.subcontratistas || {}

          // Aggregate both conductor and subcontractor documents
          const totalDocs = (conductorStats.total || 0) + (subStats.total || 0)
          const pendingDocs = (conductorStats.pendientes || 0) + (subStats.pendientes || 0)
          const approvedDocs = (conductorStats.aprobados || 0) + (subStats.aprobados || 0)
          const rejectedDocs = (conductorStats.rechazados || 0) + (subStats.rechazados || 0)

          setStats([
            {
              title: "Total de Documentos",
              value: totalDocs.toString(),
              description: "En el sistema",
              icon: FileText,
              status: "active",
              href: "/dashboard/company/documentos",
            },
            {
              title: "Documentos Aprobados",
              value: approvedDocs.toString(),
              description: "Validados",
              icon: CheckCircle,
              status: "active",
              href: "/dashboard/company/documentos/aprobados",
            },
            {
              title: "Documentos Pendientes",
              value: pendingDocs.toString(),
              description: "En revisión",
              icon: Clock,
              status: "active",
              href: "/dashboard/company/documentos/pendientes",
            },
            {
              title: "Documentos Rechazados",
              value: rejectedDocs.toString(),
              description: "No validados",
              icon: AlertTriangle,
              status: "warning",
              href: "/dashboard/company/documentos/rechazados",
            },
          ])
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
            // Use separate endpoints for sync updates
            const statsRes = await fetch(`/api/company/documents/stats`, {
              cache: "default",
            })
            
            const alertsRes = await fetch(`/api/alerts?limit=50`, {
              cache: "default",
            })

            if (statsRes.ok) {
              const statsData = await statsRes.json()
              const statsObj = statsData.stats || {}
              const conductorStats = statsObj.conductores || {}

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
            }
            
            if (alertsRes.ok) {
              const alertsData = await alertsRes.json()
              const alertsList = Array.isArray(alertsData) ? alertsData : (alertsData.alerts || [])
              setAlerts(alertsList)
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

      {/* Stats Grid - Using memoized StatCard components */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            status={stat.status}
            href={stat.href}
          />
        ))}
      </div>

      {/* Recent Alerts - Using memoized AlertItem components */}
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
                <AlertItem
                  key={alert.id}
                  id={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={alert.message}
                  created_at={alert.created_at}
                  source={alert.source}
                  metadata={alert.metadata}
                  onNavigate={() => router.push('/dashboard/company/alertas')}
                />
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
