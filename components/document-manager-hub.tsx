'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  FileStack,
  FileText,
  FolderOpen,
  RotateCw,
  Truck,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentSync } from '@/contexts/document-sync-context'

interface DocumentStats {
  total: number
  processed: number
  pendientes: number
  aprobados: number
  rechazados: number
  vencidos: number
}

interface ModuleStats {
  conductores: DocumentStats
  subcontratistas: DocumentStats
  certificaciones: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
}

interface DocumentManagerHubProps {
  stats: ModuleStats
}

export function DocumentManagerHub({ stats: initialStats }: DocumentManagerHubProps) {
  const [stats, setStats] = useState(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { onSync } = useDocumentSync()

  const refreshStats = async () => {
    const response = await fetch(`/api/company/documents/stats?_t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setStats(data.stats)
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshStats()
    } catch (error) {
      console.error('[v0] DocumentManagerHub: Error refreshing stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshStats().catch((error) => {
      console.error('[v0] DocumentManagerHub: Error verifying stats:', error)
    })

    const pollInterval = setInterval(() => {
      refreshStats().catch((error) => {
        console.error('[v0] DocumentManagerHub: Polling error:', error)
      })
    }, 10000)

    const unsubscribe = onSync((event) => {
      if (event.type === 'document_status_changed') {
        refreshStats().catch((error) => {
          console.error('[v0] DocumentManagerHub: Sync error:', error)
        })
      }
    })

    return () => {
      clearInterval(pollInterval)
      unsubscribe()
    }
  }, [onSync])

  const totalPendientes = stats.conductores.pendientes + stats.subcontratistas.pendientes
  const totalAprobados = stats.conductores.aprobados + stats.subcontratistas.aprobados
  const totalRechazados = stats.conductores.rechazados + stats.subcontratistas.rechazados
  const totalVigentes = stats.conductores.total + stats.subcontratistas.total
  const totalProcesados = stats.conductores.processed + stats.subcontratistas.processed
  const totalHistoricos = totalProcesados - totalVigentes

  const modules = [
    {
      id: 'conductores',
      title: 'Documentos de Conductores',
      description: 'Licencias, antecedentes y documentos personales',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      href: '/dashboard/company/documentos/aprobados',
      current: stats.conductores.total,
      processed: stats.conductores.processed,
      statItems: [
        { label: 'Pendientes', value: stats.conductores.pendientes, icon: Clock, color: 'text-amber-500' },
        { label: 'Aprobados', value: stats.conductores.aprobados, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Rechazados', value: stats.conductores.rechazados, icon: XCircle, color: 'text-red-500' },
        { label: 'Históricos', value: stats.conductores.processed - stats.conductores.total, icon: FileStack, color: 'text-slate-400' },
      ],
    },
    {
      id: 'subcontratistas',
      title: 'Documentos de Subcontratistas',
      description: 'F30, F30-1, contratos y documentos legales',
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      href: '/dashboard/company/documentos/aprobados',
      current: stats.subcontratistas.total,
      processed: stats.subcontratistas.processed,
      statItems: [
        { label: 'Pendientes', value: stats.subcontratistas.pendientes, icon: Clock, color: 'text-amber-500' },
        { label: 'Aprobados', value: stats.subcontratistas.aprobados, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Rechazados', value: stats.subcontratistas.rechazados, icon: XCircle, color: 'text-red-500' },
        { label: 'Históricos', value: stats.subcontratistas.processed - stats.subcontratistas.total, icon: FileStack, color: 'text-slate-400' },
      ],
    },
    {
      id: 'certificaciones',
      title: 'Certificaciones',
      description: 'Ariztia, LTS, Rendic e Interpolar',
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      href: '/dashboard/company/documentos',
      current: stats.certificaciones.total,
      processed: null,
      statItems: [
        { label: 'Asignadas', value: stats.certificaciones.vigentes, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Por vencer', value: stats.certificaciones.porVencer, icon: AlertTriangle, color: 'text-amber-500' },
        { label: 'Vencidas', value: stats.certificaciones.vencidas, icon: XCircle, color: 'text-red-500' },
      ],
    },
  ]

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-1 sm:gap-2">
              <FolderOpen className="h-5 sm:h-7 w-5 sm:w-7 text-primary flex-shrink-0" />
              <span className="truncate">Gestor de Documentos</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              {totalVigentes.toLocaleString('es-CL')} vigentes de {totalProcesados.toLocaleString('es-CL')} documentos procesados
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{totalProcesados.toLocaleString('es-CL')} procesados</span>
              <span className="sm:hidden">{totalProcesados.toLocaleString('es-CL')}</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="gap-1 text-xs h-8 px-2">
              <RotateCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        <Link href="/dashboard/company/documentos/pendientes">
          <MetricCard label="Pendientes" value={totalPendientes} icon={Clock} tone="amber" />
        </Link>
        <MetricCard label="Vigentes" value={totalVigentes} icon={FileText} tone="slate" />
        <MetricCard label="Procesados" value={totalProcesados} detail={`${totalHistoricos.toLocaleString('es-CL')} históricos`} icon={FileStack} tone="blue" />
        <Link href="/dashboard/company/documentos/aprobados">
          <MetricCard label="Aprobados" value={totalAprobados} icon={CheckCircle} tone="green" />
        </Link>
        <Link href="/dashboard/company/documentos/rechazados">
          <MetricCard label="Rechazados" value={totalRechazados} icon={XCircle} tone="red" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card key={module.id} className={`${module.bgColor} ${module.borderColor} border hover:shadow-lg transition-all duration-200 flex flex-col`}>
              <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-4 sm:h-5 w-4 sm:w-5 ${module.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">{module.current.toLocaleString('es-CL')} vigentes</Badge>
                    {module.processed !== null && (
                      <span className="text-[10px] text-muted-foreground">{module.processed.toLocaleString('es-CL')} procesados</span>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base mt-1 sm:mt-2 truncate">{module.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-2 sm:p-3 md:p-4 pt-1 sm:pt-2">
                <div className="space-y-1 sm:space-y-2 flex-1">
                  {module.statItems.map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <div key={stat.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 min-w-0">
                          <StatIcon className={`h-3 w-3 ${stat.color} flex-shrink-0`} />
                          <span className="text-slate-300 truncate">{stat.label}</span>
                        </div>
                        <span className={`font-semibold ${stat.color}`}>{stat.value.toLocaleString('es-CL')}</span>
                      </div>
                    )
                  })}
                </div>
                <Link href={module.href} className="w-full mt-2 sm:mt-3">
                  <Button variant="outline" className="w-full group text-xs h-7 sm:h-8">
                    Ver detalles
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

type MetricTone = 'amber' | 'slate' | 'blue' | 'green' | 'red'

const metricToneClasses: Record<MetricTone, { card: string; label: string; value: string; icon: string }> = {
  amber: { card: 'from-amber-900/50 to-amber-950/50 border-amber-700/50', label: 'text-amber-300/80', value: 'text-amber-400', icon: 'text-amber-500/50' },
  slate: { card: 'from-slate-800 to-slate-900 border-slate-700', label: 'text-slate-400', value: 'text-white', icon: 'text-slate-500' },
  blue: { card: 'from-blue-900/50 to-blue-950/50 border-blue-700/50', label: 'text-blue-300/80', value: 'text-blue-400', icon: 'text-blue-500/50' },
  green: { card: 'from-green-900/50 to-green-950/50 border-green-700/50', label: 'text-green-300/80', value: 'text-green-400', icon: 'text-green-500/50' },
  red: { card: 'from-red-900/50 to-red-950/50 border-red-700/50', label: 'text-red-300/80', value: 'text-red-400', icon: 'text-red-500/50' },
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: number; detail?: string; icon: typeof FileText; tone: MetricTone }) {
  const classes = metricToneClasses[tone]
  return (
    <Card className={`bg-gradient-to-br ${classes.card} h-full`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex flex-col gap-1">
          <p className={`text-xs ${classes.label}`}>{label}</p>
          <p className={`text-lg sm:text-xl md:text-2xl font-bold ${classes.value}`}>{value.toLocaleString('es-CL')}</p>
          {detail && <p className="text-[10px] text-muted-foreground">{detail}</p>}
          <Icon className={`h-4 sm:h-5 w-4 sm:w-5 ${classes.icon} mt-1`} />
        </div>
      </CardContent>
    </Card>
  )
}
