'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import useSWR from 'swr'

interface DocumentAlert {
  id: string
  subcontractor_id: string
  subcontractor_name: string
  document_type: string
  alert_type: 'pending_review' | 'expiring_soon' | 'expired' | 'rejected'
  message: string
  expires_at?: string
  is_read: boolean
}

export function DocumentAlertsWidget() {
  const { data, isLoading } = useSWR<{ alerts: DocumentAlert[] }>(
    '/api/subcontractors/alerts',
    (url) => fetch(url).then((res) => res.ok ? res.json() : { alerts: [] }),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  )

  const alerts = data?.alerts || []
  
  const counts = {
    pending: alerts.filter((a) => a.alert_type === 'pending_review').length,
    expiring: alerts.filter((a) => a.alert_type === 'expiring_soon').length,
    expired: alerts.filter((a) => a.alert_type === 'expired').length,
    rejected: alerts.filter((a) => a.alert_type === 'rejected').length,
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const getIcon = (type: string) => {
    const iconClass = 'w-4 h-4'
    switch (type) {
      case 'pending_review':
        return <AlertCircle className={`${iconClass} text-blue-400`} />
      case 'expiring_soon':
        return <Clock className={`${iconClass} text-yellow-400`} />
      case 'expired':
        return <AlertCircle className={`${iconClass} text-red-400`} />
      case 'rejected':
        return <XCircle className={`${iconClass} text-red-500`} />
      default:
        return <AlertCircle className={`${iconClass}`} />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'pending_review':
        return 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
      case 'expiring_soon':
        return 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
      case 'expired':
        return 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
      case 'rejected':
        return 'bg-red-600/10 border-red-600/30 hover:bg-red-600/20'
      default:
        return 'bg-slate-500/10 border-slate-500/30'
    }
  }

  if (isLoading) {
    return <div className="text-slate-400 text-sm">Cargando alertas...</div>
  }

  if (total === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">✓ Todo en orden</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Alertas de Documentos</CardTitle>
          <Badge className="bg-red-500/20 text-red-400">{total}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Summary badges */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {counts.pending > 0 && (
            <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-xs font-semibold text-blue-400">{counts.pending}</div>
              <div className="text-xs text-blue-300">Revisar</div>
            </div>
          )}
          {counts.expiring > 0 && (
            <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-xs font-semibold text-yellow-400">{counts.expiring}</div>
              <div className="text-xs text-yellow-300">Pronto</div>
            </div>
          )}
          {counts.expired > 0 && (
            <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-center">
              <div className="text-xs font-semibold text-red-400">{counts.expired}</div>
              <div className="text-xs text-red-300">Vencidos</div>
            </div>
          )}
          {counts.rejected > 0 && (
            <div className="px-2 py-1 rounded bg-red-600/10 border border-red-600/20 text-center">
              <div className="text-xs font-semibold text-red-500">{counts.rejected}</div>
              <div className="text-xs text-red-400">Rechazados</div>
            </div>
          )}
        </div>

        {/* Alert items */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={`p-2 rounded border cursor-pointer transition-colors ${getColor(alert.alert_type)}`}
            >
              <div className="flex items-start gap-2">
                {getIcon(alert.alert_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{alert.subcontractor_name}</p>
                  <p className="text-xs text-slate-300">{alert.document_type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length > 5 && (
          <p className="text-xs text-slate-400 text-center pt-2">
            +{alerts.length - 5} más...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

