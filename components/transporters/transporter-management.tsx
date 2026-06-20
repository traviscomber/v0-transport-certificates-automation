'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Building2, Mail, Phone, MapPin, FileText, Truck, Users } from 'lucide-react'

type Transporter = {
  id: string
  name?: string
  tax_id?: string
  rut?: string
  email?: string
  phone?: string
  city?: string
  address?: string
  is_active?: boolean
}

export function TransporterManagement() {
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/organizations?type=transportista', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Error ${response.status}`)

        const json = await response.json()
        const rows = Array.isArray(json.data) ? json.data : []
        setTransporters(rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          tax_id: row.tax_id || row.rut,
          rut: row.tax_id || row.rut,
          email: row.email,
          phone: row.phone,
          city: row.city,
          address: row.address,
          is_active: row.is_active,
        })))
      } catch (loadError) {
        console.error('Error loading transporters:', loadError)
        setError('No se pudieron cargar transportistas reales')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const filteredTransporters = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return transporters.filter((transporter) => {
      if (!search) return true
      return (
        (transporter.name || '').toLowerCase().includes(search) ||
        (transporter.rut || '').toLowerCase().includes(search) ||
        (transporter.email || '').toLowerCase().includes(search) ||
        (transporter.city || '').toLowerCase().includes(search)
      )
    })
  }, [searchTerm, transporters])

  const stats = useMemo(() => {
    const active = transporters.filter((t) => t.is_active !== false).length
    return {
      total: transporters.length,
      active,
      inactive: transporters.length - active,
    }
  }, [transporters])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm mb-1">Transportistas reales</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-green-300 text-sm mb-1">Activos</p>
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-red-300 text-sm mb-1">Inactivos</p>
            <p className="text-3xl font-bold text-red-400">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, RUT, correo o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Transportistas registrados</CardTitle>
          <CardDescription>
            {loading ? 'Cargando datos reales...' : `${filteredTransporters.length} organizaciones encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>
          ) : loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              Consultando organizaciones reales...
            </div>
          ) : filteredTransporters.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-slate-400">
              No hay transportistas que coincidan con la búsqueda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Empresa</TableHead>
                  <TableHead className="text-slate-400">RUT</TableHead>
                  <TableHead className="text-slate-400">Contacto</TableHead>
                  <TableHead className="text-slate-400">Ubicación</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransporters.map((transporter) => (
                  <TableRow key={transporter.id} className="border-slate-700/50 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transporter.name || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-400">{transporter.address || 'Sin dirección'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono">{transporter.rut || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{transporter.email || 'Sin correo'}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{transporter.phone || 'Sin teléfono'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {transporter.city || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transporter.is_active === false
                            ? 'bg-red-500/30 text-red-300 border-red-500/50'
                            : 'bg-green-500/30 text-green-300 border-green-500/50'
                        }
                      >
                        {transporter.is_active === false ? 'Inactivo' : 'Activo'}
                      </Badge>
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
