'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { StatusCards } from '@/components/operacional/status-cards'
import { AttentionRequired } from '@/components/operacional/attention-required'
import { UpcomingExpirations } from '@/components/operacional/upcoming-expirations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function ControlPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    blocked: 24,
    risk: 12,
    ok: 185,
    total: 221,
    compliance: 92
  })

  useEffect(() => {
    // Aquí iría la lógica para calcular estados reales
    // Por ahora usa datos estáticos para demo
    setLoading(false)
  }, [])

  const attentionItems = [
    { id: '1', entity: 'Transportes Willie & Dino EIRL', reason: 'Revisión técnica vencida', severity: 'critical' as const, action: 'Ver' },
    { id: '2', entity: 'AEROCAV SPA', reason: 'Certificado Ariztia vencido', severity: 'critical' as const, action: 'Ver' },
    { id: '3', entity: 'Transporte Miguel Pérez', reason: 'F30 vencida', severity: 'critical' as const, action: 'Ver' },
    { id: '4', entity: '4Vial SPA', reason: 'Seguro vence en 2 días', severity: 'critical' as const, days: 2, action: 'Subir' },
    { id: '5', entity: 'Adolfo Gonzalez Meza', reason: 'Liquidación sueldo pendiente', severity: 'warning' as const, action: 'Ver' },
    { id: '6', entity: 'Juan Manuel Vargas', reason: 'Certificado antecedentes vence en 5 días', severity: 'warning' as const, days: 5, action: 'Ver' },
    { id: '7', entity: 'Aldo Bustamante Ortega', reason: 'AFP vence en 7 días', severity: 'warning' as const, days: 7, action: 'Subir' },
  ]

  const expirationItems = [
    { id: '1', entity: 'Transportes Andina', document: 'Revisión técnica', daysRemaining: 2, expiryDate: '2026-04-13', priority: 'urgent' as const },
    { id: '2', entity: 'AEROCAV SPA', document: 'Certificado Ariztia', daysRemaining: 3, expiryDate: '2026-04-14', priority: 'urgent' as const },
    { id: '3', entity: '4Vial SPA', document: 'Seguro integral', daysRemaining: 5, expiryDate: '2026-04-16', priority: 'soon' as const },
    { id: '4', entity: 'Juan Vargas', document: 'Antecedentes', daysRemaining: 6, expiryDate: '2026-04-17', priority: 'soon' as const },
    { id: '5', entity: 'Aldo Bustamante', document: 'AFP', daysRemaining: 8, expiryDate: '2026-04-19', priority: 'soon' as const },
    { id: '6', entity: 'Ambrosio Casanova', document: 'Licencia conducir', daysRemaining: 12, expiryDate: '2026-04-23', priority: 'upcoming' as const },
    { id: '7', entity: 'Carlos Castillo', document: 'Revisión técnica', daysRemaining: 15, expiryDate: '2026-04-26', priority: 'upcoming' as const },
    { id: '8', entity: 'Diego González', document: 'Seguro', daysRemaining: 18, expiryDate: '2026-04-29', priority: 'upcoming' as const },
    { id: '9', entity: 'Fernando López', document: 'Certificado LTS', daysRemaining: 22, expiryDate: '2026-05-03', priority: 'upcoming' as const },
    { id: '10', entity: 'Gabriela Ruiz', document: 'Afiliación mutual', daysRemaining: 28, expiryDate: '2026-05-09', priority: 'upcoming' as const },
  ]

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control Operacional</h1>
          <p className="text-gray-600 mt-1">Dashboard de estado operativo - Transportes Labbé</p>
        </div>

        {!loading && (
          <>
            {/* Status Cards */}
            <StatusCards 
              blocked={stats.blocked}
              risk={stats.risk}
              ok={stats.ok}
              total={stats.total}
              compliance={stats.compliance}
            />

            {/* Dos columnas: Atención + Vencimientos */}
            <div className="grid grid-cols-2 gap-6">
              <AttentionRequired items={attentionItems} />
              <UpcomingExpirations items={expirationItems} />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Ver bloqueados ({stats.blocked})
                  </button>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                    Ver en riesgo ({stats.risk})
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Subir documento
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                    Exportar reporte
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                    Ver historial
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between pb-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">Documento subido</p>
                      <p className="text-xs text-gray-600">Transportes Andina - Certificado Ariztia</p>
                    </div>
                    <p className="text-xs text-gray-500">Hace 2h</p>
                  </div>
                  <div className="flex items-start justify-between pb-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">Validación completada</p>
                      <p className="text-xs text-gray-600">4 documentos procesados</p>
                    </div>
                    <p className="text-xs text-gray-500">Hace 4h</p>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Alerta generada</p>
                      <p className="text-xs text-gray-600">12 vencimientos en próximos 7 días</p>
                    </div>
                    <p className="text-xs text-gray-500">Ayer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DocuFleetLayout>
  )
}
