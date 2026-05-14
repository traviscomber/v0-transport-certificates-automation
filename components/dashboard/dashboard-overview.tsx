"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock, LucideIcon } from "lucide-react"
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
  metadata?: Record<string, unknown>
  source?: string
  document_type?: string
}

interface Stat {
  title: string
  value: string
  description: string
  icon: LucideIcon
  status: "active" | "warning"
  href: string
  color?: "blue" | "green" | "orange" | "red"
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
      color: "blue",
    },
    {
      title: "Documentos Aprobados",
      value: "0",
      description: "Validados",
      icon: CheckCircle,
      status: "active",
      href: "/dashboard/company/documentos/aprobados",
      color: "green",
    },
    {
      title: "Documentos Pendientes",
      value: "0",
      description: "En revisión",
      icon: Clock,
      status: "active",
      href: "/dashboard/company/documentos/pendientes",
      color: "orange",
    },
    {
      title: "Documentos Rechazados",
      value: "0",
      description: "No validados",
      icon: AlertTriangle,
      status: "warning",
      href: "/dashboard/company/documentos/rechazados",
      color: "red",
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
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
        
        const statsRes = await fetch(`/api/company/documents/stats`, {
          cache: "default",
        })

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          console.log('[v0] Fetched alerts:', alertsData)
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
              color: "blue",
            },
            {
              title: "Documentos Aprobados",
              value: approvedDocs.toString(),
              description: "Validados",
              icon: CheckCircle,
              status: "active",
              href: "/dashboard/company/documentos/aprobados",
              color: "green",
            },
            {
              title: "Documentos Pendientes",
              value: pendingDocs.toString(),
              description: "En revisión",
              icon: Clock,
              status: "active",
              href: "/dashboard/company/documentos/pendientes",
              color: "orange",
            },
            {
              title: "Documentos Rechazados",
              value: rejectedDocs.toString(),
              description: "No validados",
              icon: AlertTriangle,
              status: "warning",
              href: "/dashboard/company/documentos/rechazados",
              color: "red",
            },
          ])
        }
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Fetch data immediately
    fetchData()

    // Set interval to refresh alerts every 10 seconds (source of truth)
    const interval = setInterval(fetchData, 10000)

    return () => clearInterval(interval)
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
            color={stat.color}
          />
        ))}
      </div>

      {/* Recent Alerts - Organized by category */}
      {alerts.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 col-span-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Alertas Recientes</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Actividad del sistema - {alerts.length} alertas
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Quick stats badges */}
                {(() => {
                  const approved = alerts.filter(a => a.type?.toUpperCase().includes('APPROVED')).length
                  const rejected = alerts.filter(a => a.type?.toUpperCase().includes('REJECTED')).length
                  const pending = alerts.filter(a => a.type?.toUpperCase().includes('PENDING') || a.type?.toUpperCase().includes('UPLOAD')).length
                  const expiring = alerts.filter(a => a.type?.toUpperCase().includes('EXPIR') || a.type?.toUpperCase().includes('VENC')).length
                  return (
                    <>
                      {approved > 0 && (
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                          {approved} aprobados
                        </span>
                      )}
                      {rejected > 0 && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                          {rejected} rechazados
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                          {pending} nuevos
                        </span>
                      )}
                      {expiring > 0 && (
                        <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                          {expiring} por vencer
                        </span>
                      )}
                    </>
                  )
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/company/alertas')}
                >
                  Ver todas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {alerts.slice(0, 20).map((alert) => (
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
            {alerts.length > 20 && (
              <p className="text-xs text-muted-foreground text-center mt-4 py-2 border-t border-slate-700">
                + {alerts.length - 20} alertas más - <button onClick={() => router.push('/dashboard/company/alertas')} className="text-orange-400 hover:underline">Ver todas</button>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
