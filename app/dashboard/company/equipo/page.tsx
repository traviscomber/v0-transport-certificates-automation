'use client'

import { TeamSearch } from '@/components/team-search'

export default function EquipoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-[#303238] pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Equipo</p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-[#F2F0EB] sm:text-3xl">
          Gestión de Equipo
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A9ADB3]">
          Busca y contacta a las personas responsables de la operación de Transportes Labbé.
        </p>
      </header>

      <TeamSearch />
    </div>
  )
}
