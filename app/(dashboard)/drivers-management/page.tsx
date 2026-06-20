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
  Users,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Building2,
} from 'lucide-react'

type Driver = {
  id: string
  full_name?: string
  nombre?: string
  rut?: string
  phone?: string
  email?: string
  license_number?: string
  license_type?: string
  license_expiry?: string
  is_active?: boolean
  organization?: {
    id: string
    name?: string
  } | null
  assignments?: Array<{
    vehicle?: {
      id: string
      plate?: string
      brand?: string
      model?: string
    }
  }>
}

export default function DriversManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    const loadDrivers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/drivers', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setDrivers(Array.isArray(data.data) ? data.data : [])
      } catch (loadError) {
        console.error('Error loading drivers:', loadError)
        setError('No se pudieron cargar conductores reales')
      } finally {
        setLoading(false)
      }
    }

    void loadDrivers()
  }, [])

  const filteredDrivers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return drivers.filter((driver) => {
      if (!search) return true
      return (
        (driver.full_name || driver.nombre || '').toLowerCase().includes(search) ||
        (driver.rut || '').toLowerCase().includes(search) ||
        (driver.email || '').toLowerCase().includes(search) ||
        (driver.phone || '').toLowerCase().includes(search) ||
        (driver.organization?.name || '').toLowerCase().includes(search)
      )
    })
  }, [drivers, searchTerm])

  const counts = useMemo(() => {
    const active = drivers.filter((driver) => driver.is_active !== false).length
    const inactive = drivers.length - active
    const expiring = drivers.filter((driver) => {
      if (!driver.license_expiry) return false
      const expiry = new Date(driver.license_expiry)
      const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 30
    }).length

    return {
      total: drivers.length,
      active,
      inactive,
      expiring,
    }
  }, [drivers])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBadge = (driver: Driver) => {
    if (driver.is_active === false) {
      return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Inactivo</Badge>
    }

    if (!driver.license_expiry) {
      return <Badge className="bg-slate-500/30 text-slate-300 border-slate-500/50">Sin vencimiento</Badge>
    }

    const diffDays = Math.ceil((new Date(driver.license_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Vencida</Badge>
    if (diffDays <= 30) return <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">Por vencer</Badge>
    return <Badge className="bg-green-500/30 text-green-300 border-green-500/50">Vigente</Badge>
  }

  const getDisplayName = (driver: Driver) => driver.full_name || driver.nombre || 'Sin nombre'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-cyan-400" />
            Gestión de Conductores reales
          </h1>
          <p className="text-muted-foreground">Conductores cargados desde la base de datos, con búsqueda y estado real</p>
        </div>
        <Button className="btn-orange" asChild>
          <a href="/admin/conductores/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Conductor
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{counts.total}</p>
              </div>
              <Users className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Vigentes</p>
                <p className="text-2xl font-bold text-green-400">{counts.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Por vencer</p>
                <p className="text-2xl font-bold text-yellow-400">{counts.expiring}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
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
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, RUT, correo, teléfono u organización..."
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
          <CardTitle className="text-foreground">Lista de conductores</CardTitle>
          <CardDescription>
            {loading ? 'Cargando datos reales...' : `${filteredDrivers.length} conductores encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>
          ) : loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              Consultando conductores reales...
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              No hay conductores que coincidan con los filtros.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Conductor</TableHead>
                  <TableHead className="text-slate-400">RUT</TableHead>
                  <TableHead className="text-slate-400">Contacto</TableHead>
                  <TableHead className="text-slate-400">Organización</TableHead>
                  <TableHead className="text-slate-400">Licencia</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const vehicle = driver.assignments?.[0]?.vehicle
                  const status = driver.is_active === false ? 45 : driver.license_expiry ? 100 : 70

                  return (
                    <TableRow key={driver.id} className="border-slate-700/50 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <Users className="h-5 w-5 text-slate-300" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{getDisplayName(driver)}</p>
                            {vehicle ? (
                              <p className="text-xs text-slate-400">
                                {vehicle.plate || 'Sin patente'} {vehicle.brand || ''} {vehicle.model || ''}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{driver.rut || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="h-3 w-3" /> {driver.phone || 'Sin teléfono'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3" /> {driver.email || 'Sin correo'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {driver.organization?.name || 'Sin organización'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground">{driver.license_type || 'Sin clase'}</p>
                          <p className="text-xs text-slate-400">
                            {driver.license_number ? `N° ${driver.license_number}` : 'Sin número'}{' '}
                            {driver.license_expiry ? `· Vence: ${driver.license_expiry}` : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(driver)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(status)}`}>{status}%</span>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
