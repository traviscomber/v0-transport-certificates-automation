'use client'

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
  Building2, 
  Plus, 
  Search, 
  MoreHorizontal,
  Users,
  Truck,
  FileText,
  TrendingUp,
} from 'lucide-react'

// Demo data
const organizations = [
  { id: '1', name: 'Transportes del Norte SpA', rut: '76.123.456-7', type: 'transportista', city: 'Santiago', drivers: 12, vehicles: 8, score: 94 },
  { id: '2', name: 'Logistica Central Ltda', rut: '77.234.567-8', type: 'transportista', city: 'Valparaiso', drivers: 8, vehicles: 5, score: 87 },
  { id: '3', name: 'Distribuidora Sur SA', rut: '78.345.678-9', type: 'mandante', city: 'Concepcion', drivers: 0, vehicles: 0, score: 100 },
  { id: '4', name: 'Carga Express Chile', rut: '79.456.789-0', type: 'transportista', city: 'Antofagasta', drivers: 15, vehicles: 12, score: 72 },
  { id: '5', name: 'Retail Nacional SA', rut: '80.567.890-1', type: 'mandante', city: 'Santiago', drivers: 0, vehicles: 0, score: 100 },
]

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.rut.includes(searchTerm)
    const matchesType = !filterType || org.type === filterType
    return matchesSearch && matchesType
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const transportistas = organizations.filter(o => o.type === 'transportista')
  const mandantes = organizations.filter(o => o.type === 'mandante')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-purple-400" />
            Organizaciones
          </h1>
          <p className="text-muted-foreground">Gestiona mandantes y transportistas</p>
        </div>
        <Button className="btn-orange">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Organizacion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{organizations.length}</p>
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
                <p className="text-2xl font-bold text-blue-400">{transportistas.length}</p>
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
                <p className="text-2xl font-bold text-purple-400">{mandantes.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Score Promedio</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round(organizations.reduce((acc, o) => acc + o.score, 0) / organizations.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
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
            <div className="flex gap-2">
              <Button 
                variant={filterType === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterType(null)}
                className={filterType === null ? "btn-orange" : "border-slate-600"}
              >
                Todos
              </Button>
              <Button 
                variant={filterType === 'transportista' ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterType('transportista')}
                className={filterType === 'transportista' ? "btn-orange" : "border-slate-600"}
              >
                Transportistas
              </Button>
              <Button 
                variant={filterType === 'mandante' ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterType('mandante')}
                className={filterType === 'mandante' ? "btn-orange" : "border-slate-600"}
              >
                Mandantes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Organizaciones</CardTitle>
          <CardDescription>{filteredOrgs.length} organizaciones encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Organizacion</TableHead>
                <TableHead className="text-slate-400">RUT</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Ciudad</TableHead>
                <TableHead className="text-slate-400">Recursos</TableHead>
                <TableHead className="text-slate-400">Score</TableHead>
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono">{org.rut}</TableCell>
                  <TableCell>
                    <Badge className={org.type === 'mandante' 
                      ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                      : 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                    }>
                      {org.type === 'mandante' ? 'Mandante' : 'Transportista'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{org.city}</TableCell>
                  <TableCell>
                    {org.type === 'transportista' ? (
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Users className="h-4 w-4" /> {org.drivers}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Truck className="h-4 w-4" /> {org.vehicles}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`text-2xl font-bold ${getScoreColor(org.score)}`}>
                      {org.score}%
                    </span>
                  </TableCell>
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
