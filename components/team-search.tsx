'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, Search } from 'lucide-react'

type TeamMember = {
  id: string
  email: string
  full_name: string | null
  role: string | null
  phone: string | null
  is_active: boolean | null
}

function roleLabel(role: string | null) {
  if (role === 'dispatcher') return 'Ejecutiva'
  if (role === 'admin') return 'Administrador'
  if (role === 'driver') return 'Conductor'
  return role || 'Equipo Labbé'
}

export function TeamSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTeam() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/company/users', { cache: 'no-store' })
        if (!response.ok) throw new Error(`No fue posible cargar el equipo (${response.status})`)
        const data = await response.json()
        if (!cancelled) setTeam(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setTeam([])
          setError(err instanceof Error ? err.message : 'No fue posible cargar el equipo')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadTeam()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredTeam = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return team

    return team.filter((member) =>
      String(member.full_name || '').toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      roleLabel(member.role).toLowerCase().includes(query) ||
      String(member.phone || '').toLowerCase().includes(query)
    )
  }, [searchQuery, team])

  const counts = useMemo(() => [
    { label: 'Equipo activo', value: team.length },
    { label: 'Ejecutivas', value: team.filter((member) => member.role === 'dispatcher').length },
    { label: 'Administradores', value: team.filter((member) => member.role === 'admin').length },
    { label: 'Otros roles', value: team.filter((member) => !['dispatcher', 'admin'].includes(member.role || '')).length },
  ], [team])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[5px] bg-[#303238] md:grid-cols-4">
        {counts.map((item) => (
          <div key={item.label} className="bg-[#181A1D] px-4 py-4">
            <p className="text-xs text-[#A9ADB3]">{item.label}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums text-[#F2F0EB]">{isLoading ? '—' : item.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[5px] bg-[#181A1D] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-[#F2F0EB]">Directorio operativo</h2>
            <p className="mt-1 text-sm text-[#A9ADB3]">
              {isLoading ? 'Cargando perfiles activos…' : `${filteredTeam.length} de ${team.length} personas visibles`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777C84]" />
            <input
              type="search"
              placeholder="Nombre, email, rol o teléfono"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-[5px] border border-[#303238] bg-[#202226] pl-9 pr-3 text-sm text-[#F2F0EB] outline-none placeholder:text-[#777C84] focus:border-[#742D3D] focus:ring-2 focus:ring-[#742D3D]/25"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-[5px] border border-[#45242B] bg-[#202226] px-5 py-6 text-sm text-[#C6C8CC]">
            <p className="font-medium text-[#E17B8C]">No fue posible cargar el directorio.</p>
            <p className="mt-2 text-xs text-[#A9ADB3]">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="mt-5 py-10 text-center text-sm text-[#A9ADB3]">Cargando equipo activo…</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeam.length > 0 ? (
              filteredTeam.map((member) => (
                <article
                  key={member.id}
                  className="rounded-[5px] bg-[#202226] p-4 transition-colors hover:bg-[#25282D]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-[#F2F0EB]">
                        {member.full_name || member.email}
                      </h3>
                      <p className="mt-1 text-xs text-[#A9ADB3]">{roleLabel(member.role)}</p>
                    </div>
                    <span className="rounded-[5px] bg-[#181A1D] px-2 py-1 text-[11px] text-[#A9ADB3]">
                      Activo
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex min-h-9 items-center gap-2 rounded-[5px] px-2 text-[#C6C8CC] transition-colors hover:bg-[#181A1D] hover:text-[#F2F0EB]"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#777C84]" />
                      <span className="truncate">{member.email}</span>
                    </a>

                    {member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '')}`}
                        className="flex min-h-9 items-center gap-2 rounded-[5px] px-2 text-[#C6C8CC] transition-colors hover:bg-[#181A1D] hover:text-[#F2F0EB]"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#777C84]" />
                        <span>{member.phone}</span>
                      </a>
                    ) : (
                      <div className="flex min-h-9 items-center gap-2 px-2 text-[#777C84]">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Sin teléfono registrado</span>
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-sm text-[#A9ADB3]">
                No se encontraron personas que coincidan con la búsqueda.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
