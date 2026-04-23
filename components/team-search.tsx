/**
 * GESTIÓN DE EQUIPO
 * 
 * Panel para visualizar y buscar miembros del equipo LABBE.
 * Aquí puedes:
 * - Buscar miembros por nombre, RUT, cargo o teléfono
 * - Ver información de contacto directo
 * - Identificar roles y responsabilidades
 * - Conectar con ejecutivas, gerentes, coordinadores
 */

'use client'

import { useState, useMemo } from 'react'
import { Search, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { allTeamMembers } from '@/lib/data/team-members'

export function TeamSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeam = useMemo(() => {
    if (!searchQuery) return allTeamMembers

    const query = searchQuery.toLowerCase()
    return allTeamMembers.filter(
      (member) =>
        member.nombre_completo.toLowerCase().includes(query) ||
        member.rut.toLowerCase().includes(query) ||
        member.cargo.toLowerCase().includes(query) ||
        member.telefono.includes(query) ||
        member.email.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Educativo */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Gestión de Equipo</h2>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Visualiza y contacta a los miembros del equipo LABBE. Cada uno tiene un rol específico en tu operación. Busca por nombre, RUT, cargo o teléfono.
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-white">{allTeamMembers.length}</div>
            <p className="text-xs text-slate-400">Total de Miembros</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-400">{allTeamMembers.filter(m => m.cargo.includes('Ejecutiva')).length}</div>
            <p className="text-xs text-blue-300">Ejecutivas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-400">{allTeamMembers.filter(m => m.cargo.includes('Gerente')).length}</div>
            <p className="text-xs text-green-300">Gerentes</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/20 border-orange-800">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-400">{allTeamMembers.filter(m => m.cargo.includes('Coordinador')).length}</div>
            <p className="text-xs text-orange-300">Coordinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Card con búsqueda */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Buscar Miembro del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, RUT, email, cargo o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-400">
              {filteredTeam.length} de {allTeamMembers.length} miembros
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeam.length > 0 ? (
                filteredTeam.map((member) => (
                  <div
                    key={member.rut}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-orange-500 transition-colors"
                  >
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="text-white font-semibold text-sm leading-tight">
                        {member.nombre_completo}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          {member.cargo}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      {/* RUT */}
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 text-xs mt-0.5">RUT:</span>
                        <span className="text-slate-300 font-mono text-xs">{member.rut}</span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <a
                          href={`mailto:${member.email}`}
                          className="text-slate-300 hover:text-orange-500 transition-colors text-xs"
                        >
                          {member.email}
                        </a>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <a
                          href={`tel:+56${member.telefono.replace(/\s/g, '')}`}
                          className="text-slate-300 hover:text-orange-500 transition-colors text-xs"
                        >
                          {member.telefono}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">No se encontraron miembros del equipo</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
