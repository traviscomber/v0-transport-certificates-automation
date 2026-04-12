'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OperacionesHoyPage() {
  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operaciones Hoy</h1>
          <p className="text-gray-600 mt-1">Vista de todas las operaciones activas</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">24</div>
              <p className="text-sm text-gray-600 mt-2">Requieren acción inmediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">197</div>
              <p className="text-sm text-gray-600 mt-2">Funcionando normalmente</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Lista detallada en desarrollo</p>
          </CardContent>
        </Card>
      </div>
    </DocuFleetLayout>
  )
}
