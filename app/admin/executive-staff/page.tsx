import { ExecutiveStaffManager } from '@/components/admin/executive-staff-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Executive Staff Management',
  description: 'Manage company executives and HR personnel',
}

export default function ExecutiveStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Staff</h1>
        <p className="text-gray-500 mt-2">
          Manage executives and HR personnel across your organization
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-500">Transportes Labbe staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-gray-500">Ejecutivas positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">HR Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-500">HR management staff</p>
          </CardContent>
        </Card>
      </div>

      <ExecutiveStaffManager />

      <Card>
        <CardHeader>
          <CardTitle>Executive Staff Directory</CardTitle>
          <CardDescription>
            Quick reference for Transportes Labbe key personnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  name: 'Olga Lydia Carrasco Olivares',
                  role: 'Ejecutiva',
                  phone: '+56977764753'
                },
                {
                  name: 'Carolina Pilar Sepulveda Contreras',
                  role: 'Ejecutiva',
                  phone: '+56950067666'
                },
                {
                  name: 'Daniela Constanza Silva Rojas',
                  role: 'Ejecutiva',
                  phone: '+56978540722'
                },
                {
                  name: 'Cecilia Del Carmen Farias Muñoz',
                  role: 'Ejecutiva',
                  phone: '+56978540798'
                },
                {
                  name: 'Diego Andres Gonzalez Valenzuela',
                  role: 'Jefe RRHH',
                  phone: '+56978455527'
                },
                {
                  name: 'Katherinne Johanna Canales Hernandez',
                  role: 'Asistente RRHH',
                  phone: '+56956139744'
                }
              ].map((person, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="font-semibold">{person.name}</div>
                  <div className="text-sm text-gray-600">{person.role}</div>
                  <div className="text-sm text-blue-600 mt-1">{person.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
