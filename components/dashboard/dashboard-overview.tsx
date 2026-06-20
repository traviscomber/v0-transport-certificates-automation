"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle, Clock, LucideIcon, ArrowRight } from "lucide-react"
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
    <div className="space-y-5">
      {/* Hero ejecutivo - KPIs + barra de cumplimiento */}
      <Card className="overflow-hidden border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-2xl">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 mb-2">
                Panel ejecutivo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                Control Operacional
              </h1>
              <p className="text-sm text-slate-400 max-w-xl">
                Vista ejecutiva para priorizar documentos, alertas y seguimiento operativo con foco en decisiones rápidas.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-3xl font-bold text-white">{completionRate}%</span>
              <span className="text-xs uppercase tracking-widest text-slate-400">cumplimiento</span>
              <div className="w-32 h-2 rounded-full bg-slate-800 mt-1">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPI cards - una sola vez, 4 métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => router.push("/dashboard/company/documentos")}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-4 py-5 hover:bg-slate-900/70 hover:border-slate-500 transition-all text-left group"
            >
              <FileText className="h-4 w-4 text-slate-500 mb-3 group-hover:text-slate-300 transition-colors" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Total</p>
              <p className="mt-1 text-3xl font-bold text-white">{totalDocuments.toLocaleString('es-CL')}</p>
              <p className="mt-1 text-xs text-slate-500">Todos los documentos</p>
            </button>
            <button
              onClick={() => router.push("/dashboard/company/documentos/aprobados")}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-5 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
            >
              <CheckCircle className="h-4 w-4 text-emerald-500/60 mb-3 group-hover:text-emerald-400 transition-colors" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">Aprobados</p>
              <p className="mt-1 text-3xl font-bold text-emerald-200">{approvedDocuments.toLocaleString('es-CL')}</p>
              <p className="mt-1 text-xs text-emerald-300/50">Validados y listos</p>
            </button>
            <button
              onClick={() => router.push("/dashboard/company/documentos/pendientes")}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-5 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
            >
              <Clock className="h-4 w-4 text-amber-500/60 mb-3 group-hover:text-amber-400 transition-colors" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70">Pendientes</p>
              <p className="mt-1 text-3xl font-bold text-amber-200">{pendingDocuments.toLocaleString('es-CL')}</p>
              <p className="mt-1 text-xs text-amber-300/50">En revisión activa</p>
            </button>
            <button
              onClick={() => router.push("/dashboard/company/documentos/rechazados")}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-5 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-left group"
            >
              <AlertTriangle className="h-4 w-4 text-red-500/60 mb-3 group-hover:text-red-400 transition-colors" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-red-300/70">Rechazados</p>
              <p className="mt-1 text-3xl font-bold text-red-200">{rejectedDocuments.toLocaleString('es-CL')}</p>
              <p className="mt-1 text-xs text-red-300/50">No validados</p>
            </button>
          </div>

          {/* Riesgo total y acciones rápidas */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/40 px-5 py-4">
            <p className="text-sm text-slate-300">
              {openRiskItems > 0 ? (
                <>
                  <span className="font-semibold text-orange-300">{openRiskItems.toLocaleString('es-CL')} documentos en riesgo</span>
                  <span className="text-slate-400"> — {rejectedDocuments} rechazados + {pendingDocuments} pendientes</span>
                </>
              ) : (
                <span className="text-emerald-400 font-medium">Sin riesgos abiertos en el periodo actual.</span>
              )}
            </p>
            <div className="flex gap-2 flex-wrap shrink-0">
              <Link href="/dashboard/company/documentos/vencidos">
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-300 hover:bg-red-500/10 h-8 text-xs">
                  Ver vencidos <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </Link>
              <Link href="/dashboard/company/documentos/renovar">
                <Button variant="outline" size="sm" className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 h-8 text-xs">
                  Renovaciones <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </Link>
              <Link href="/dashboard/company/reportes">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800 h-8 text-xs">
                  Reportes <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

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
