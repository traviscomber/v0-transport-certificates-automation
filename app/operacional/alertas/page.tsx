'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

export default function AlertasPage() {
  const alerts = [
    {
      id: 1,
      severity: 'critical',
      title: 'Documentos vencidos',
      message: '24 subcontratistas tienen documentos vencidos',
      timestamp: 'Hace 2 horas'
    },
    {
      id: 2,
      severity: 'warning',
      title: 'Próximos a vencer',
      message: '12 documentos vencen en los próximos 7 días',
      timestamp: 'Hace 1 hora'
    },
    {
      id: 3,
      severity: 'info',
      title: 'Certificación recibida',
      message: 'Transportes Andina - Certificado Ariztia actualizado',
      timestamp: 'Hace 30 minutos'
    }
  ]

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600 mt-1">Sistema de notificaciones operacionales</p>
        </div>

        <div className="space-y-3">
          {alerts.map(alert => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-600 bg-red-50' :
              alert.severity === 'warning' ? 'border-l-amber-600 bg-amber-50' :
              'border-l-blue-600 bg-blue-50'
            }`}>
              <CardContent className="flex gap-4 pt-6">
                <div>
                  {alert.severity === 'critical' && <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                  {alert.severity === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />}
                  {alert.severity === 'info' && <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    alert.severity === 'critical' ? 'text-red-900' :
                    alert.severity === 'warning' ? 'text-amber-900' :
                    'text-blue-900'
                  }`}>
                    {alert.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    alert.severity === 'critical' ? 'text-red-800' :
                    alert.severity === 'warning' ? 'text-amber-800' :
                    'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DocuFleetLayout>
  )
}
