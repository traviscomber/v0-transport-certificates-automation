'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Bell, CheckCircle, Clock, Filter, Archive } from 'lucide-react'

interface Alert {
  id: string
  title: string
  message: string
  type: 'warning' | 'error' | 'info' | 'success'
  category: 'compliance' | 'certificate' | 'document' | 'system'
  status: 'unread' | 'read' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'critical'
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const { data } = await response.json()
        setAlerts(data || [])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return alert.status === 'unread'
    if (filter === 'critical') return alert.priority === 'critical'
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className='h-5 w-5 text-red-500' />
      case 'warning': return <AlertTriangle className='h-5 w-5 text-yellow-500' />
      case 'success': return <CheckCircle className='h-5 w-5 text-green-500' />
      default: return <Bell className='h-5 w-5 text-blue-500' />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/30 text-red-200 border-red-500/50'
      case 'high': return 'bg-orange-500/30 text-orange-200 border-orange-500/50'
      case 'normal': return 'bg-blue-500/30 text-blue-200 border-blue-500/50'
      default: return 'bg-slate-500/30 text-slate-200 border-slate-500/50'
    }
  }

  return (
    <div className='min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-foreground'>Sistema de Alertas</h1>
          <p className='text-muted-foreground'>Notificaciones de compliance, certificados y documentos</p>
        </div>

        {/* Filters */}
        <div className='flex gap-3'>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className='btn-orange'
          >
            Todas ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
          >
            <Bell className='h-4 w-4 mr-2' />
            Sin leer ({alerts.filter(a => a.status === 'unread').length})
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            onClick={() => setFilter('critical')}
          >
            <AlertTriangle className='h-4 w-4 mr-2' />
            Críticas ({alerts.filter(a => a.priority === 'critical').length})
          </Button>
        </div>

        {/* Alerts List */}
        <div className='space-y-4'>
          {loading ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <div className='text-muted-foreground'>Cargando alertas...</div>
              </CardContent>
            </Card>
          ) : filteredAlerts.length === 0 ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
                <div className='text-foreground font-semibold'>Sin alertas</div>
                <div className='text-muted-foreground'>¡Todo está en orden!</div>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map(alert => (
              <Card key={alert.id} className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='mt-1'>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='font-semibold text-foreground'>{alert.title}</h3>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        {alert.status === 'unread' && (
                          <Badge className='bg-blue-500/30 text-blue-200 border border-blue-500/50'>
                            Sin leer
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground text-sm mb-3'>{alert.message}</p>
                      <div className='flex items-center justify-between'>
                        <div className='flex gap-2 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {new Date(alert.created_at).toLocaleDateString('es-ES')}
                          </span>
                          <span className='capitalize'>{alert.category}</span>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='outline' size='sm' className='text-xs'>
                            Ver detalles
                          </Button>
                          <Button variant='outline' size='sm' className='text-xs'>
                            <Archive className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
