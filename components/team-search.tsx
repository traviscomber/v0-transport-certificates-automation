'use client'

import { useState, useMemo } from 'react'
import { Search, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { teamMembers } from '@/lib/data/team-members'

export function TeamSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeam = useMemo(() => {
    if (!searchQuery) return teamMembers

    const query = searchQuery.toLowerCase()
    return teamMembers.filter(
      (member) =>
        member.nombre_completo.toLowerCase().includes(query) ||
        member.rut.toLowerCase().includes(query) ||
        member.cargo.toLowerCase().includes(query) ||
        member.telefono.includes(query)
    )
  }, [searchQuery])

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Equipo Labbe Transportes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, cargo o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-400">
            {filteredTeam.length} de {teamMembers.length} miembros
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

                    {/* Email */}
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <a
                          href={`mailto:${member.email}`}
                          className="text-slate-300 hover:text-orange-500 transition-colors text-xs truncate"
                          title={member.email}
                        >
                          {member.email}
                        </a>
                      </div>
                    )}
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
  )
}
