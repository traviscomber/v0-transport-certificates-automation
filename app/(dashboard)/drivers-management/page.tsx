'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react'

// Demo data
const drivers = [
  { id: '1', name: 'Juan Perez', rut: '12.345.678-9', phone: '+56 9 1234 5678', email: 'juan@email.com', license: 'A-2', licenseExpiry: '2024-08-15', score: 95, status: 'active' },
  { id: '2', name: 'Maria Lopez', rut: '11.222.333-4', phone: '+56 9 8765 4321', email: 'maria@email.com', license: 'A-3', licenseExpiry: '2024-05-20', score: 88, status: 'active' },
  { id: '3', name: 'Carlos Rodriguez', rut: '10.111.222-3', phone: '+56 9 5555 6666', email: 'carlos@email.com', license: 'A-2', licenseExpiry: '2024-03-10', score: 72, status: 'warning' },
  { id: '4', name: 'Ana Martinez', rut: '15.666.777-8', phone: '+56 9 7777 8888', email: 'ana@email.com', license: 'A-4', licenseExpiry: '2024-12-01', score: 100, status: 'active' },
  { id: '5', name: 'Pedro Sanchez', rut: '14.555.444-5', phone: '+56 9 3333 2222', email: 'pedro@email.com', license: 'A-2', licenseExpiry: '2024-02-28', score: 45, status: 'critical' },
]

export default function DriversManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.rut.includes(searchTerm)
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/30 text-green-300 border-green-500/50">Conforme</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">Alerta</Badge>
      case 'critical':
        return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Critico</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-cyan-400" />
            Gestion de Conductores
          </h1>
          <p className="text-muted-foreground">Administra los conductores y su documentacion</p>
        </div>
        <Button className="btn-orange">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conductor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{drivers.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Conformes</p>
                <p className="text-2xl font-bold text-green-400">{drivers.filter(d => d.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Alertas</p>
                <p className="text-2xl font-bold text-yellow-400">{drivers.filter(d => d.status === 'warning').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Criticos</p>
                <p className="text-2xl font-bold text-red-400">{drivers.filter(d => d.status === 'critical').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
            <Button variant="outline" className="border-slate-600">
              Filtros
            </Button>
            <Button variant="outline" className="border-slate-600">
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Conductores</CardTitle>
          <CardDescription>{filteredDrivers.length} conductores encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Conductor</TableHead>
                <TableHead className="text-slate-400">RUT</TableHead>
                <TableHead className="text-slate-400">Contacto</TableHead>
                <TableHead className="text-slate-400">Licencia</TableHead>
                <TableHead className="text-slate-400">Score</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{driver.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{driver.rut}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="h-3 w-3" /> {driver.phone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" /> {driver.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground">{driver.license}</p>
                      <p className="text-xs text-slate-400">Vence: {driver.licenseExpiry}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-2xl font-bold ${getScoreColor(driver.score)}`}>
                      {driver.score}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
