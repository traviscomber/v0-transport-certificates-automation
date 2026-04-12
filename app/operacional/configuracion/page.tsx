'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamSearch } from '@/components/team-search'
import { SystemCredentialsList } from '@/components/system-credentials-list'

export default function ConfiguracionPage() {
  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestión de equipo, credenciales y parámetros</p>
        </div>

        <Tabs defaultValue="equipo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equipo">Equipo</TabsTrigger>
            <TabsTrigger value="credenciales">Credenciales</TabsTrigger>
            <TabsTrigger value="parametros">Parámetros</TabsTrigger>
          </TabsList>

          <TabsContent value="equipo" className="mt-6">
            <TeamSearch />
          </TabsContent>

          <TabsContent value="credenciales" className="mt-6">
            <SystemCredentialsList />
          </TabsContent>

          <TabsContent value="parametros" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Parámetros del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días para alertar próximos vencimientos
                    </label>
                    <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de notificaciones
                    </label>
                    <input type="email" defaultValue="admin@labbe.cl" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Guardar cambios
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DocuFleetLayout>
  )
}
