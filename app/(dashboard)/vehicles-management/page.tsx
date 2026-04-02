'use client'

export const dynamic = 'force-dynamic'

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
  Truck, 
  Plus, 
  Search, 
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from 'lucide-react'

// Demo data
const vehicles = [
  { id: '1', plate: 'ABC-123', brand: 'Mercedes-Benz', model: 'Actros 2646', year: 2022, type: 'camion', rtv: '2024-06-15', soap: '2024-08-01', score: 100, status: 'active' },
  { id: '2', plate: 'XY-4567', brand: 'Volvo', model: 'FH 540', year: 2021, type: 'camion', rtv: '2024-04-20', soap: '2024-05-10', score: 85, status: 'warning' },
  { id: '3', plate: 'JK-8901', brand: 'Scania', model: 'R450', year: 2020, type: 'semi', rtv: '2024-03-01', soap: '2024-03-15', score: 60, status: 'critical' },
  { id: '4', plate: 'LM-2345', brand: 'Iveco', model: 'Stralis', year: 2023, type: 'camion', rtv: '2024-12-01', soap: '2024-12-15', score: 100, status: 'active' },
  { id: '5', plate: 'NO-6789', brand: 'DAF', model: 'XF 480', year: 2021, type: 'trailer', rtv: '2024-07-20', soap: '2024-09-01', score: 92, status: 'active' },
]

export default function VehiclesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      camion: 'Camion',
      furgon: 'Furgon',
      trailer: 'Trailer',
      semi: 'Semi-remolque',
      otro: 'Otro',
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Truck className="h-8 w-8 text-green-400" />
            Gestion de Vehiculos
          </h1>
          <p className="text-muted-foreground">Administra la flota y su documentacion</p>
        </div>
        <Button className="btn-orange">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehiculo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Flota</p>
                <p className="text-2xl font-bold text-white">{vehicles.length}</p>
              </div>
              <Truck className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Conformes</p>
                <p className="text-2xl font-bold text-green-400">{vehicles.filter(v => v.status === 'active').length}</p>
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
                <p className="text-2xl font-bold text-yellow-400">{vehicles.filter(v => v.status === 'warning').length}</p>
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
                <p className="text-2xl font-bold text-red-400">{vehicles.filter(v => v.status === 'critical').length}</p>
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
                placeholder="Buscar por patente, marca o modelo..."
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

      {/* Vehicles Table */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Vehiculos</CardTitle>
          <CardDescription>{filteredVehicles.length} vehiculos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Vehiculo</TableHead>
                <TableHead className="text-slate-400">Patente</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Documentos</TableHead>
                <TableHead className="text-slate-400">Score</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-xs text-slate-400">Ano {vehicle.year}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-lg font-bold text-foreground">{vehicle.plate}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {getTypeLabel(vehicle.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-400">RTV:</span>
                        <span className="text-foreground">{vehicle.rtv}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-400">SOAP:</span>
                        <span className="text-foreground">{vehicle.soap}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-2xl font-bold ${getScoreColor(vehicle.score)}`}>
                      {vehicle.score}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
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
