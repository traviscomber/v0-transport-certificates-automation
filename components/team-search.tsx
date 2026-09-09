'use client'

import { useMemo, useState } from 'react'
import { Search, Mail, MessageCircle } from 'lucide-react'
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

  const counts = [
    { label: 'Total', value: allTeamMembers.length },
    { label: 'Ejecutivas', value: allTeamMembers.filter(m => m.cargo.includes('Ejecutiva')).length },
    { label: 'Gerentes', value: allTeamMembers.filter(m => m.cargo.includes('Gerente')).length },
    { label: 'Coordinadores', value: allTeamMembers.filter(m => m.cargo.includes('Coordinador')).length },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[5px] bg-[#303238] md:grid-cols-4">
        {counts.map((item) => (
          <div key={item.label} className="bg-[#181A1D] px-4 py-4">
            <p className="text-xs text-[#A9ADB3]">{item.label}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums text-[#F2F0EB]">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[5px] bg-[#181A1D] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-[#F2F0EB]">Directorio</h2>
            <p className="mt-1 text-sm text-[#A9ADB3]">
              {filteredTeam.length} de {allTeamMembers.length} personas visibles
            </p>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777C84]" />
            <input
              type="search"
              placeholder="Nombre, RUT, email, cargo o teléfono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-[5px] border border-[#303238] bg-[#202226] pl-9 pr-3 text-sm text-[#F2F0EB] outline-none placeholder:text-[#777C84] focus:border-[#742D3D] focus:ring-2 focus:ring-[#742D3D]/25"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeam.length > 0 ? (
            filteredTeam.map((member) => (
              <article
                key={member.rut}
                className="rounded-[5px] bg-[#202226] p-4 transition-colors hover:bg-[#25282D]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-[#F2F0EB]">{member.nombre_completo}</h3>
                    <p className="mt-1 text-xs text-[#A9ADB3]">{member.cargo}</p>
                  </div>
                  <span className="rounded-[5px] bg-[#181A1D] px-2 py-1 font-mono text-[11px] text-[#A9ADB3]">
                    {member.rut}
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

                  <a
                    href={`https://web.whatsapp.com/send/?phone=56${member.telefono.replace(/\s/g, '')}&text=Hola+${member.nombre_completo.replace(/\s/g, '+')},+quer%C3%ADa+comunicarme+contigo.&type=phone_number&app_absent=0`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-9 items-center gap-2 rounded-[5px] px-2 text-[#C6C8CC] transition-colors hover:bg-[#181A1D] hover:text-[#F2F0EB]"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#777C84]" />
                    <span>WhatsApp: {member.telefono}</span>
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-sm text-[#A9ADB3]">
              No se encontraron miembros del equipo.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
