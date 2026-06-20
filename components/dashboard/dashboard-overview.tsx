"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock, LucideIcon, ArrowRight } from "lucide-react"
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
  const totalDocuments = Number(stats[0]?.value || 0)
  const approvedDocuments = Number(stats[1]?.value || 0)
  const pendingDocuments = Number(stats[2]?.value || 0)
  const rejectedDocuments = Number(stats[3]?.value || 0)
  const activeAlerts = alerts.length
  const openRiskItems = pendingDocuments + rejectedDocuments
  const completionRate = totalDocuments > 0 ? Math.round((approvedDocuments / totalDocuments) * 100) : 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the SAME endpoint as DocumentManagerHub - /api/company/documents/stats
        // This ensures Control Operacional shows EXACT same numbers as Gestor de Documentos
        const timestamp = Date.now()
        const alertsRes = await fetch(`/api/alerts?limit=50&_t=${timestamp}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        })
        
        // Use the SAME stats endpoint as the Gestor de Documentos
        const statsRes = await fetch(`/api/company/documents/stats?_t=${timestamp}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        })

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          const alertsList = Array.isArray(alertsData) ? alertsData : (alertsData.alerts || [])
          setAlerts(alertsList)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          const stats = statsData.stats || {}
          
          // Calculate totals from conductor + subcontractor stats (same logic as Gestor)
          const conductorStats = stats.conductores || {}
          const subStats = stats.subcontratistas || {}
          
          const totalDocs = (conductorStats.total || 0) + (subStats.total || 0)
          const pendingDocs = (conductorStats.pendientes || 0) + (subStats.pendientes || 0)
          const approvedDocs = (conductorStats.aprobados || 0) + (subStats.aprobados || 0)
          const rejectedDocs = (conductorStats.rechazados || 0) + (subStats.rechazados || 0)

          console.log('[v0] Dashboard Stats from /api/company/documents/stats:', {
            total: totalDocs,
            pending: pendingDocs,
            approved: approvedDocs,
            rejected: rejectedDocs
          })

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

    // Set interval to refresh every 10 seconds
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
            // Use the SAME stats endpoint as initial fetch
            const statsRes = await fetch(`/api/company/documents/stats?_t=${Date.now()}`, {
              cache: "no-store",
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              }
            })

            if (statsRes.ok) {
              const statsData = await statsRes.json()
              const stats = statsData.stats || {}
              
              const conductorStats = stats.conductores || {}
              const subStats = stats.subcontratistas || {}
              
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
          Vista ejecutiva mensual para priorizar documentos, alertas y seguimiento operativo.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-2xl shadow-slate-950/20">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                Panel ejecutivo premium
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Control Operacional
                </h1>
                <p className="max-w-2xl text-sm md:text-base text-slate-300">
                  Vista ejecutiva mensual para priorizar documentos, alertas y seguimiento operativo con foco en decisiones rápidas.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium">
                  Vista ejecutiva mensual
                </span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                  Datos reales sincronizados
                </span>
                <span className="px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-300 text-xs font-medium">
                  Prioridad operativa
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Documentos</p>
                <p className="mt-2 text-3xl md:text-4xl font-bold text-white">{totalDocuments.toLocaleString('es-CL')}</p>
                <p className="mt-1 text-xs text-slate-400">Volumen total en seguimiento</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Aprobados</p>
                <p className="mt-2 text-3xl md:text-4xl font-bold text-emerald-200">{approvedDocuments.toLocaleString('es-CL')}</p>
                <p className="mt-1 text-xs text-emerald-200/70">Validados y listos</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80">Pendientes</p>
                <p className="mt-2 text-3xl md:text-4xl font-bold text-amber-200">{pendingDocuments.toLocaleString('es-CL')}</p>
                <p className="mt-1 text-xs text-amber-200/70">Revisión activa</p>
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-red-300/80">Alertas</p>
                <p className="mt-2 text-3xl md:text-4xl font-bold text-red-200">{activeAlerts.toLocaleString('es-CL')}</p>
                <p className="mt-1 text-xs text-red-200/70">{rejectedDocuments.toLocaleString('es-CL')} rechazados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-slate-700">
        <CardContent className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Acceso rápido</p>
            <p className="text-base font-semibold text-white">Lo más útil para la gestión diaria</p>
            <p className="text-sm text-slate-400">Revisa reportes, vencimientos y documentos pendientes sin navegar de más.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium">
                Vista ejecutiva mensual
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                Datos reales sincronizados
              </span>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 text-xs font-medium">
                Prioridad operativa
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm lg:max-w-none lg:w-auto">
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Documentos</p>
              <p className="text-lg font-semibold text-white">{stats[0]?.value || '0'}</p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Cumplimiento</p>
              <p className="text-lg font-semibold text-emerald-300">{completionRate}%</p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Alertas</p>
              <p className="text-lg font-semibold text-red-300">{alerts.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pendientes + rechazados</p>
              <p className="text-2xl font-semibold text-orange-300 mt-1">{openRiskItems}</p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Aprobados</p>
              <p className="text-2xl font-semibold text-emerald-300 mt-1">{approvedDocuments}</p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Alertas activas</p>
              <p className="text-2xl font-semibold text-red-300 mt-1">{activeAlerts}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            <Link href="/dashboard/company/reportes">
              <Button variant="outline" size="sm" className="w-full justify-between border-slate-600 text-slate-200 hover:bg-slate-800">
                Ver reportes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/company/documentos/vencidos">
              <Button variant="outline" size="sm" className="w-full justify-between border-red-500/30 text-red-300 hover:bg-red-500/10">
                Ver vencidos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/company/documentos/renovar">
              <Button variant="outline" size="sm" className="w-full justify-between border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                Planificar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
                <CardTitle className="text-xl">Alertas Prioritarias</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Lo más importante del período - {alerts.length} alertas
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
                + {alerts.length - 20} alertas más - <button onClick={() => router.push('/dashboard/company/alertas')} className="text-orange-400 hover:underline">Abrir panel completo</button>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
