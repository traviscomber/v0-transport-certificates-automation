'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Users, 
  Truck, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  BarChart3,
  RotateCw
} from 'lucide-react'
import Link from 'next/link'
import { useDocumentSync } from '@/contexts/document-sync-context'

interface DocumentStats {
  total: number
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
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { onSync } = useDocumentSync()

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/company/documents/stats?_t=' + Date.now(), {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('[v0] DocumentManagerHub: Error refreshing stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Listen for document status changes and refetch stats
  useEffect(() => {
    // On mount, verify stats are fresh by refetching from API
    const verifyAndRefreshStats = async () => {
      try {
        const response = await fetch('/api/company/documents/stats?_t=' + Date.now(), {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('[v0] DocumentManagerHub: Error verifying stats on mount:', error)
      }
    }
    
    verifyAndRefreshStats()
    
    // Set up polling interval - refresh stats every 10 seconds
    const pollInterval = setInterval(() => {
      verifyAndRefreshStats()
    }, 10000) // 10 seconds
    
    // Set up sync listener for immediate updates on status changes
    const unsubscribe = onSync((event) => {
      if (event.type === 'document_status_changed') {
        // Refetch immediately on status change
        verifyAndRefreshStats()
      }
    })

    return () => {
      clearInterval(pollInterval)
      unsubscribe()
    }
  }, [onSync])

  const modules = [
    {
      id: 'conductores',
      title: 'Documentos de Conductores',
      description: 'Licencias, antecedentes, y documentos personales',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      href: '/dashboard/company/documentos/aprobados',
      stats: stats.conductores,
      statItems: [
        { label: 'Pendientes', value: stats.conductores.pendientes, icon: Clock, color: 'text-amber-500' },
        { label: 'Aprobados', value: stats.conductores.aprobados, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Rechazados', value: stats.conductores.rechazados, icon: XCircle, color: 'text-red-500' },
      ]
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
      stats: stats.subcontratistas,
      statItems: [
        { label: 'Pendientes', value: stats.subcontratistas.pendientes, icon: Clock, color: 'text-amber-500' },
        { label: 'Aprobados', value: stats.subcontratistas.aprobados, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Rechazados', value: stats.subcontratistas.rechazados, icon: XCircle, color: 'text-red-500' },
      ]
    },
    {
      id: 'certificaciones',
      title: 'Certificaciones',
      description: 'Ariztia, LTS, Rendic, Interpolar',
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      href: '/dashboard/company/documentos',
      stats: stats.certificaciones,
      statItems: [
        { label: 'Vigentes', value: stats.certificaciones.vigentes, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Por Vencer', value: stats.certificaciones.porVencer, icon: AlertTriangle, color: 'text-amber-500' },
        { label: 'Vencidas', value: stats.certificaciones.vencidas, icon: XCircle, color: 'text-red-500' },
      ]
    },
  ]

  // Calculate totals
  const totalPendientes = stats.conductores.pendientes + stats.subcontratistas.pendientes
  const totalAprobados = stats.conductores.aprobados + stats.subcontratistas.aprobados
  const totalRechazados = stats.conductores.rechazados + stats.subcontratistas.rechazados
  const totalDocumentos = stats.conductores.total + stats.subcontratistas.total

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Header - Compact */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-1 sm:gap-2">
              <FolderOpen className="h-5 sm:h-7 w-5 sm:w-7 text-primary flex-shrink-0" />
              <span className="truncate">Gestor de Documentos</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
              Centro de gestión documental para conductores, subcontratistas y certificaciones
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{totalDocumentos} docs</span>
              <span className="sm:hidden">{totalDocumentos}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-1 text-xs h-8 px-2 flex-shrink-0"
            >
              <RotateCw className={`h-3 w-3 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Link href="/dashboard/company/documentos/pendientes">
          <Card className="bg-gradient-to-br from-amber-900/50 to-amber-950/50 border-amber-700/50 hover:border-amber-500/70 transition-colors cursor-pointer group h-full">
            <CardContent className="p-2 sm:p-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-amber-300/80">Pendientes</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-amber-400">{totalPendientes}</p>
                <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500/50 group-hover:text-amber-400 transition-colors mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 h-full">
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{totalDocumentos}</p>
              <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-slate-500 mt-1" />
            </div>
          </CardContent>
        </Card>
        
        <Link href="/dashboard/company/documentos/aprobados">
          <Card className="bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-700/50 hover:border-green-500/70 transition-colors cursor-pointer group h-full">
            <CardContent className="p-2 sm:p-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-green-300/80">Aprobados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">{totalAprobados}</p>
                <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-500/50 group-hover:text-green-400 transition-colors mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/company/documentos/rechazados">
          <Card className="bg-gradient-to-br from-red-900/50 to-red-950/50 border-red-700/50 hover:border-red-500/70 transition-colors cursor-pointer group h-full">
            <CardContent className="p-2 sm:p-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-red-300/80">Rechazados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">{totalRechazados}</p>
                <XCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-500/50 group-hover:text-red-400 transition-colors mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Module Cards - Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card 
              key={module.id} 
              className={`${module.bgColor} ${module.borderColor} border hover:shadow-lg transition-all duration-200 flex flex-col`}
            >
              <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-4 sm:h-5 w-4 sm:w-5 ${module.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {'total' in module.stats ? module.stats.total : 0}
                  </Badge>
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
                        <span className={`font-semibold ${stat.color} flex-shrink-0 ml-1`}>{stat.value}</span>
                      </div>
                    )
                  })}
                </div>
                
                <Link href={module.href} className="w-full mt-2 sm:mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full group text-xs h-7 sm:h-8"
                  >
                    Ver Detalles
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
