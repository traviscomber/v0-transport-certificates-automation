'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  title: string
  message: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/company/alerts', {
          signal: AbortSignal.timeout(5000)
        })
        if (!response.ok) throw new Error('Failed to fetch alerts')
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading alerts')
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-950/30 border-red-700 text-red-200'
      case 'warning':
        return 'bg-yellow-950/30 border-yellow-700 text-yellow-200'
      default:
        return 'bg-blue-950/30 border-blue-700 text-blue-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h1 className="text-3xl font-bold text-slate-100">Alertas</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Total: {alerts.length} alertas
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Cargando alertas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-700 text-red-200 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No hay alertas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-2">{alert.description}</p>
                    <p className="text-xs opacity-50 mt-2">
                      {new Date(alert.timestamp).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
