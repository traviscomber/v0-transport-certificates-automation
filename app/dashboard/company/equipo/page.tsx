'use client'

import { HelpBox } from '@/components/ui/help-box'
import { TeamSearch } from '@/components/team-search'

export default function EquipoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Equipo</h1>
        <p className="text-muted-foreground">
          Visualiza y contacta a los 6 ejecutivos del equipo LABBE
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Equipo LABBE Transportes"
        description="Accede a la información de contacto completa del equipo de LABBE. Puedes comunicarte directamente mediante email o WhatsApp con cada miembro."
        tips={[
          "Haz clic en el icono de email para enviar correos directamente",
          "Usa WhatsApp para comunicarte de forma inmediata",
          "Busca por nombre, email, cargo o teléfono",
          "Todos los miembros son ejecutivos y personal administrativo clave"
        ]}
      />

      <TeamSearch />
    </div>
  )
}
