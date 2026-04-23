'use client'

import { TeamSearch } from '@/components/team-search'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpBox } from '@/components/ui/help-box'

export default function EquipoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Equipo</h1>
        <p className="text-muted-foreground">
          Visualiza y contacta a los miembros del equipo LABBE
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Equipo LABBE"
        description="Accede a la información de contacto del equipo de LABBE Transportes. Puedes comunicarte directamente mediante email o WhatsApp."
        tips={[
          "Haz clic en el icono de email para enviar correos directamente",
          "Usa WhatsApp para comunicarte de forma inmediata",
          "Busca por nombre, email, cargo o teléfono",
          "Todos los miembros son ejecutivos y personal administrativo",
        ]}
      />

      <TeamSearch />
    </div>
  )
}
