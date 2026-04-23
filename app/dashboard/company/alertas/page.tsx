'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { HelpBox } from '@/components/ui/help-box'

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Simular carga de alertas
        setAlerts([
          { id: 1, type: 'warning', title: 'Documentos próximos a vencer', description: 'Hay 5 documentos que vencen en los próximos 7 días' },
          { id: 2, type: 'info', title: 'Actualización de sistema', description: 'Se realizó una actualización del portal' },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alertas y Notificaciones</h1>
        <p className="text-muted-foreground">
          Mantente informado de eventos importantes en tu operación
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Centro de Alertas"
        description="Recibe notificaciones sobre documentos próximos a vencer, cambios de estado y otros eventos importantes de tu operación."
        tips={[
          "Las alertas se actualizan en tiempo real",
          "Presta atención a las alertas de vencimiento de documentos",
          "Revisa regularmente para estar al día con tu operación",
        ]}
      />

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={alert.type === 'warning' ? 'border-orange-500' : 'border-blue-500'}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                {alert.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                ) : (
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
