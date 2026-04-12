'use client'

import { useState } from 'react'
import { Search, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Subcontractor {
  id?: string
  rut: string
  nombre: string
  nombre_fantasia?: string
  representante: string
  ejecutiva: string
  region: string
  direccion: string
  comuna: string
  ciudad: string
  telefono: string
  email: string
  ariztia?: boolean
  lts?: boolean
  rendic?: boolean
  interpolar?: boolean
  is_active: boolean
}

interface SubcontractorsListProps {
  subcontractors: Subcontractor[]
}

export function SubcontractorsList({ subcontractors }: SubcontractorsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')

  const filtered = subcontractors.filter(sub => {
    const matchesSearch =
      sub.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.rut.includes(searchTerm) ||
      sub.ejecutiva.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRegion = selectedRegion === 'all' || sub.region === selectedRegion
    
    return matchesSearch && matchesRegion
  })

  const regions = Array.from(new Set(subcontractors.map(s => s.region))).sort()
  const certifications = { ariztia: 'Ariztia', lts: 'LTS', rendic: 'Rendic', interpolar: 'Interpolar' }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-300 block mb-2">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre, RUT o ejecutiva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Región</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
          >
            <option value="all">Todas las regiones</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Mostrando {filtered.length} de {subcontractors.length} subcontratistas
      </div>

      {/* Subcontractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => (
          <Card key={sub.id || sub.rut} className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-white truncate">{sub.nombre_fantasia || sub.nombre}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">{sub.rut}</p>
                </div>
                {sub.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Representante */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Representante</p>
                <p className="text-sm text-slate-200">{sub.representante}</p>
              </div>

              {/* Ejecutiva */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ejecutiva</p>
                <p className="text-sm text-orange-400 font-medium">{sub.ejecutiva}</p>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">{sub.comuna}</p>
                  <p className="text-xs text-slate-400">{sub.region}</p>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-1.5">
                {sub.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <a href={`tel:${sub.telefono}`} className="text-slate-300 hover:text-orange-400 truncate">
                      {sub.telefono}
                    </a>
                  </div>
                )}
                {sub.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <a href={`mailto:${sub.email}`} className="text-slate-300 hover:text-orange-400 truncate">
                      {sub.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Certificaciones */}
              {(sub.ariztia || sub.lts || sub.rendic || sub.interpolar) && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                  {sub.ariztia && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.ariztia}</Badge>}
                  {sub.lts && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.lts}</Badge>}
                  {sub.rendic && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.rendic}</Badge>}
                  {sub.interpolar && <Badge variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700">{certifications.interpolar}</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No se encontraron subcontratistas que coincidan con tu búsqueda</p>
        </div>
      )}
    </div>
  )
}
