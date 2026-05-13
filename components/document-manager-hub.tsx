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
      href: '/dashboard/company/conductores',
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
      href: '/dashboard/company/subcontratistas',
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
      href: '/dashboard/company/subcontratistas',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            Gestor de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de gestión documental para conductores, subcontratistas y certificaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            {totalDocumentos} documentos totales
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Documentos</p>
                <p className="text-2xl font-bold text-white">{totalDocumentos}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        
        <Link href="/dashboard/company/documentos/pendientes">
          <Card className="bg-gradient-to-br from-amber-900/50 to-amber-950/50 border-amber-700/50 hover:border-amber-500/70 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300/80">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-400">{totalPendientes}</p>
                  <p className="text-xs text-amber-400/60 mt-1 group-hover:text-amber-300 transition-colors">
                    Click para revisar
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/company/documentos/aprobados">
          <Card className="bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-700/50 hover:border-green-500/70 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300/80">Aprobados</p>
                  <p className="text-2xl font-bold text-green-400">{totalAprobados}</p>
                  <p className="text-xs text-green-400/60 mt-1 group-hover:text-green-300 transition-colors">
                    Click para revisar
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/50 group-hover:text-green-400 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/company/documentos/rechazados">
          <Card className="bg-gradient-to-br from-red-900/50 to-red-950/50 border-red-700/50 hover:border-red-500/70 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300/80">Rechazados</p>
                  <p className="text-2xl font-bold text-red-400">{totalRechazados}</p>
                  <p className="text-xs text-red-400/60 mt-1 group-hover:text-red-300 transition-colors">
                    Click para revisar
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500/50 group-hover:text-red-400 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card 
              key={module.id} 
              className={`${module.bgColor} ${module.borderColor} border hover:shadow-lg transition-all duration-200`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {'total' in module.stats ? module.stats.total : 0} total
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.statItems.map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <div key={stat.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatIcon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-slate-300">{stat.label}</span>
                        </div>
                        <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                      </div>
                    )
                  })}
                </div>
                
                <Link href={module.href}>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group"
                  >
                    Ver Detalles
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
