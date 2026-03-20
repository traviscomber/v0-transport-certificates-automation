'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Filter, RefreshCw, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface QueueItem {
  id: string
  documentId: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: string
  reviewReason: string
  confidenceScore: number | null
  documentTypeName: string
  documentCategory: string
  slaStatus: string
  hoursRemaining: number
  createdAt: string
}

interface QueueStats {
  total: number
  pending: number
  inReview: number
  completed: number
  byPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  slaBreach: {
    breached: number
    urgent: number
    warning: number
    ok: number
  }
  avgWaitTimeMinutes: number
}

const priorityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20'
}

const slaStatusColors = {
  breached: 'text-red-500',
  urgent: 'text-orange-500',
  warning: 'text-yellow-500',
  ok: 'text-green-500'
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all'
  })

  useEffect(() => {
    fetchQueue()
    fetchStats()
  }, [filters])

  async function fetchQueue() {
    try {
      const params = new URLSearchParams()
      if (filters.priority !== 'all') params.set('priority', filters.priority)
      if (filters.category !== 'all') params.set('category', filters.category)
      
      const res = await fetch(`/api/v2/review-queue?${params}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.items)
      }
    } catch (err) {
      console.error('Error fetching queue:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/v2/review-queue?action=stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/walmart-ocr" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">Cola de Revision Manual</h1>
            </div>
            <Button onClick={() => { fetchQueue(); fetchStats() }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-500">{stats.byPriority.critical}</div>
                <p className="text-sm text-muted-foreground">Criticos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-500">{stats.slaBreach.breached}</div>
                <p className="text-sm text-muted-foreground">SLA Vencido</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.avgWaitTimeMinutes}m</div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
          <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Critica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="empresa">Empresa</SelectItem>
              <SelectItem value="conductor">Conductor</SelectItem>
              <SelectItem value="vehiculo">Vehiculo</SelectItem>
              <SelectItem value="seguridad">Seguridad</SelectItem>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="subcontratacion">Subcontratacion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queue List */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Pendientes de Revision</CardTitle>
            <CardDescription>
              Revisa y valida los documentos que requieren atencion manual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Cola vacia</h3>
                <p className="text-muted-foreground">No hay documentos pendientes de revision</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/walmart-ocr/review/${item.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={priorityColors[item.priority]}>
                        {item.priority.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-medium">{item.documentTypeName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{item.documentCategory}</span>
                          <span>-</span>
                          <span>{item.reviewReason}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {item.confidenceScore !== null && (
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round(item.confidenceScore * 100)}%</div>
                          <div className="text-xs text-muted-foreground">Confianza</div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className={`text-sm font-medium flex items-center gap-1 ${slaStatusColors[item.slaStatus as keyof typeof slaStatusColors] || ''}`}>
                          <Clock className="h-3 w-3" />
                          {item.hoursRemaining > 0 ? `${Math.round(item.hoursRemaining)}h` : 'Vencido'}
                        </div>
                        <div className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
