'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  FileSpreadsheet,
} from 'lucide-react'
import { ClientsXlsImporter } from './clients-xls-importer'

// Mock data
const mockClients = [
  {
    id: '1',
    rut: '76.123.456-7',
    razonSocial: 'Transportes Santiago SpA',
    email: 'contacto@transantiago.com',
    telefono: '+56912345678',
    ciudad: 'Santiago',
    estado: 'activo',
    totalVehiculos: 24,
    totalConductores: 18,
    complianceScore: 92,
  },
  {
    id: '2',
    rut: '76.234.567-8',
    razonSocial: 'Logística Express Ltda',
    email: 'info@logexp.com',
    telefono: '+56923456789',
    ciudad: 'Valparaíso',
    estado: 'activo',
    totalVehiculos: 15,
    totalConductores: 12,
    complianceScore: 88,
  },
  {
    id: '3',
    rut: '76.345.678-9',
    razonSocial: 'Transportes del Sur SA',
    email: 'contacto@transur.com',
    telefono: '+56934567890',
    ciudad: 'Concepción',
    estado: 'pendiente',
    totalVehiculos: 8,
    totalConductores: 6,
    complianceScore: 75,
  },
]

export function ClientsManagementPanel() {
  const [activeTab, setActiveTab] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = mockClients.filter(client =>
    client.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rut.includes(searchTerm)
  )

  const stats = {
    totalClientes: mockClients.length,
    activos: mockClients.filter(c => c.estado === 'activo').length,
    totalVehiculos: mockClients.reduce((sum, c) => sum + c.totalVehiculos, 0),
    totalConductores: mockClients.reduce((sum, c) => sum + c.totalConductores, 0),
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Clientes Totales</p>
            <p className="text-3xl font-bold text-white">{stats.totalClientes}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Activos</p>
            <p className="text-3xl font-bold text-white">{stats.activos}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <FileSpreadsheet className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Vehículos Totales</p>
            <p className="text-3xl font-bold text-white">{stats.totalVehiculos}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Conductores Totales</p>
            <p className="text-3xl font-bold text-white">{stats.totalConductores}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="list">Listado de Clientes</TabsTrigger>
          <TabsTrigger value="import">Importar XLS</TabsTrigger>
        </TabsList>

        {/* Clients List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Transportistas Registrados</CardTitle>
                  <CardDescription>Gestiona las empresas transportistas en el sistema</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Clients Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400">Razón Social</th>
                      <th className="px-4 py-3 text-left text-slate-400">RUT</th>
                      <th className="px-4 py-3 text-left text-slate-400">Email</th>
                      <th className="px-4 py-3 text-left text-slate-400">Estado</th>
                      <th className="px-4 py-3 text-left text-slate-400">Compliance</th>
                      <th className="px-4 py-3 text-right text-slate-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{client.razonSocial}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono text-xs">{client.rut}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{client.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={client.estado === 'activo' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                            {client.estado === 'activo' ? 'Activo' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-6 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                style={{ width: `${client.complianceScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">{client.complianceScore}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No se encontraron clientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <ClientsXlsImporter />
        </TabsContent>
      </Tabs>
    </div>
  )
}
