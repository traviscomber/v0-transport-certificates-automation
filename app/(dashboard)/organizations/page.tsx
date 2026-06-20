'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Truck,
  Users,
  ArrowRight,
} from 'lucide-react'

type Organization = {
  id: string
  name?: string
  tax_id?: string
  rut?: string
  type?: string
  service_type?: string
  city?: string
  address?: string
  email?: string
  phone?: string
  is_active?: boolean
}

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/organizations', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const data = await response.json()
        setOrganizations(Array.isArray(data.data) ? data.data : [])
      } catch (loadError) {
        console.error('Error loading organizations:', loadError)
        setError('No se pudieron cargar organizaciones reales')
      } finally {
        setLoading(false)
      }
    }

    void loadOrganizations()
  }, [])

  const normalizedOrganizations = useMemo(() => {
    return organizations.map((org) => ({
      ...org,
      type: (org.type || org.service_type || 'unknown').toLowerCase(),
      rut: org.tax_id || org.rut || '',
      name: org.name || 'Sin nombre',
    }))
  }, [organizations])

  const filteredOrgs = useMemo(() => {
    return normalizedOrganizations.filter((org) => {
      const search = searchTerm.trim().toLowerCase()
      const matchesSearch =
        search.length === 0 ||
        org.name.toLowerCase().includes(search) ||
        org.rut.toLowerCase().includes(search) ||
        (org.email || '').toLowerCase().includes(search) ||
        (org.city || '').toLowerCase().includes(search)
      const matchesType = !filterType || org.type === filterType
      return matchesSearch && matchesType
    })
  }, [filterType, normalizedOrganizations, searchTerm])

  const counts = useMemo(() => {
    const active = normalizedOrganizations.filter((org) => org.is_active !== false).length
    const transportistas = normalizedOrganizations.filter((org) => org.type.includes('transport') || org.type === 'transportista').length
    const mandantes = normalizedOrganizations.filter((org) => org.type.includes('mandante') || org.type.includes('client')).length
    const others = normalizedOrganizations.length - transportistas - mandantes

    return {
      total: normalizedOrganizations.length,
      active,
      transportistas,
      mandantes,
      others: Math.max(others, 0),
    }
  }, [normalizedOrganizations])

  const filterOptions = [
    { key: null, label: 'Todos' },
    { key: 'transportista', label: 'Transportistas' },
    { key: 'mandante', label: 'Mandantes' },
    { key: 'unknown', label: 'Otros' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-purple-400" />
            Organizaciones reales
          </h1>
          <p className="text-muted-foreground">Listado de organizaciones cargadas desde Supabase</p>
        </div>
        <Button className="btn-orange" asChild>
          <Link href="/admin/transportistas">
            <Plus className="h-4 w-4 mr-2" />
            Ver administración
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
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
              <Building2 className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Transportistas</p>
                <p className="text-2xl font-bold text-blue-400">{counts.transportistas}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Mandantes</p>
                <p className="text-2xl font-bold text-purple-400">{counts.mandantes}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Activas</p>
                <p className="text-2xl font-bold text-green-400">{counts.active}</p>
              </div>
              <Users className="h-8 w-8 text-green-500/50" />
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
                placeholder="Buscar por nombre, RUT, ciudad o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.label}
                  variant={filterType === option.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(option.key)}
                  className={filterType === option.key ? 'btn-orange' : 'border-slate-600'}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de organizaciones</CardTitle>
          <CardDescription>
            {loading ? 'Cargando datos reales...' : `${filteredOrgs.length} organizaciones encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>
          ) : loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              Consultando organizaciones reales...
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              No hay organizaciones que coincidan con los filtros.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Organización</TableHead>
                  <TableHead className="text-slate-400">RUT</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Ciudad</TableHead>
                  <TableHead className="text-slate-400">Contacto</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id} className="border-slate-700/50 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{org.name}</p>
                          <p className="text-xs text-slate-400">{org.address || 'Sin dirección registrada'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono">{org.rut || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          org.type.includes('mandante')
                            ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                            : org.type.includes('transport')
                              ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                              : 'bg-slate-500/30 text-slate-200 border-slate-500/50'
                        }
                      >
                        {org.type.includes('mandante')
                          ? 'Mandante'
                          : org.type.includes('transport')
                            ? 'Transportista'
                            : org.type || 'Otro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{org.city || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p>{org.email || 'Sin correo'}</p>
                        <p>{org.phone || 'Sin teléfono'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          org.is_active === false
                            ? 'border-red-500/50 text-red-300'
                            : 'border-green-500/50 text-green-300'
                        }
                      >
                        {org.is_active === false ? 'Inactiva' : 'Activa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
