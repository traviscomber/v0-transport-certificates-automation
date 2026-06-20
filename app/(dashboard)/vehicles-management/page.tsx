'use client'

import { useEffect, useMemo, useState } from 'react'
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
  CheckCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react'

type Vehicle = {
  id: string
  plate?: string
  brand?: string
  model?: string
  year?: number
  type?: string
  vin?: string
  is_active?: boolean
  organization?: {
    id: string
    name?: string
  } | null
}

export default function VehiclesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/vehicles', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setVehicles(Array.isArray(data.data) ? data.data : [])
      } catch (loadError) {
        console.error('Error loading vehicles:', loadError)
        setError('No se pudieron cargar vehículos reales')
      } finally {
        setLoading(false)
      }
    }

    void loadVehicles()
  }, [])

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      if (!search) return true
      return (
        (vehicle.plate || '').toLowerCase().includes(search) ||
        (vehicle.brand || '').toLowerCase().includes(search) ||
        (vehicle.model || '').toLowerCase().includes(search) ||
        (vehicle.organization?.name || '').toLowerCase().includes(search)
      )
    })
  }, [searchTerm, vehicles])

  const counts = useMemo(() => {
    const active = vehicles.filter((vehicle) => vehicle.is_active !== false).length
    const inactive = vehicles.length - active
    const byOrg = new Map<string, number>()

    vehicles.forEach((vehicle) => {
      const orgName = vehicle.organization?.name || 'Sin organización'
      byOrg.set(orgName, (byOrg.get(orgName) || 0) + 1)
    })

    const topOrganization = Array.from(byOrg.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos'

    return {
      total: vehicles.length,
      active,
      inactive,
      topOrganization,
    }
  }, [vehicles])

  const getStatusBadge = (vehicle: Vehicle) => {
    return vehicle.is_active === false ? (
      <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Inactivo</Badge>
    ) : (
      <Badge className="bg-green-500/30 text-green-300 border-green-500/50">Activo</Badge>
    )
  }

  const getTypeLabel = (type?: string) => {
    const value = (type || '').toLowerCase()
    const map: Record<string, string> = {
      camion: 'Camión',
      furgon: 'Furgón',
      trailer: 'Tráiler',
      semi: 'Semi-remolque',
      semi_remolque: 'Semi-remolque',
      otro: 'Otro',
    }
    return map[value] || value || 'Sin tipo'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Truck className="h-8 w-8 text-green-400" />
            Gestión de Vehículos reales
          </h1>
          <p className="text-muted-foreground">Flota cargada desde la base de datos, sin inventar fechas ni estados</p>
        </div>
        <Button className="btn-orange" asChild>
          <a href="/admin/vehiculos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total flota</p>
                <p className="text-2xl font-bold text-white">{counts.total}</p>
              </div>
              <Truck className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Activos</p>
                <p className="text-2xl font-bold text-green-400">{counts.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Inactivos</p>
                <p className="text-2xl font-bold text-red-400">{counts.inactive}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Mayor presencia</p>
                <p className="text-sm font-bold text-blue-200 mt-1">{counts.topOrganization}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por patente, marca, modelo u organización..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de vehículos</CardTitle>
          <CardDescription>
            {loading ? 'Cargando datos reales...' : `${filteredVehicles.length} vehículos encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>
          ) : loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              Consultando vehículos reales...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              No hay vehículos que coincidan con los filtros.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Vehículo</TableHead>
                  <TableHead className="text-slate-400">Patente</TableHead>
                  <TableHead className="text-slate-400">Organización</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">VIN</TableHead>
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
                          <p className="font-medium text-foreground">
                            {vehicle.brand || 'Sin marca'} {vehicle.model || ''}
                          </p>
                          <p className="text-xs text-slate-400">{vehicle.year || 'Año no informado'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-lg font-bold text-foreground">{vehicle.plate || '-'}</span>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {vehicle.organization?.name || 'Sin organización'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {getTypeLabel(vehicle.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono text-xs">
                      {vehicle.vin || 'Sin VIN'}
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle)}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
