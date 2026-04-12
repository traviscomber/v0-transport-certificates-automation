'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, User, Package } from 'lucide-react'

export default function HistorialPage() {
  const events = [
    {
      id: 1,
      user: 'Carolina Sepúlveda',
      action: 'Subió documento',
      entity: 'Transportes Andina',
      type: 'Certificado Ariztia',
      timestamp: 'Hoy 14:32',
      status: 'success'
    },
    {
      id: 2,
      user: 'Sistema',
      action: 'Validó documento',
      entity: 'AEROCAV SPA',
      type: 'F30',
      timestamp: 'Hoy 12:15',
      status: 'success'
    },
    {
      id: 3,
      user: 'Daniela Silva',
      action: 'Marcó como vencido',
      entity: 'Transporte Willie & Dino EIRL',
      type: 'Revisión técnica',
      timestamp: 'Ayer 09:47',
      status: 'warning'
    },
    {
      id: 4,
      user: 'Sistema',
      action: 'Notificó vencimiento',
      entity: 'Multiple',
      type: 'Próximos 7 días',
      timestamp: 'Ayer 08:00',
      status: 'info'
    }
  ]

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Eventos</h1>
          <p className="text-gray-600 mt-1">Registro de todas las operaciones realizadas</p>
        </div>

        <div className="space-y-3">
          {events.map(event => (
            <Card key={event.id}>
              <CardContent className="flex gap-4 pt-6">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  event.status === 'success' ? 'bg-green-100' :
                  event.status === 'warning' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  <Clock className={`w-5 h-5 ${
                    event.status === 'success' ? 'text-green-600' :
                    event.status === 'warning' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{event.action}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{event.entity}</span> • {event.type}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Por: {event.user}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DocuFleetLayout>
  )
}
