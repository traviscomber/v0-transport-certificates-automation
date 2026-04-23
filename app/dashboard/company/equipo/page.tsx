'use client'

import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { HelpBox } from '@/components/ui/help-box'
import { InsertarUsuariosButton } from '@/components/admin/insertar-usuarios-button'
import { CleanupProfilesButton } from '@/components/admin/cleanup-profiles-button'
import { CleanAllUsersButton } from '@/components/admin/clean-all-users-button'
import { UsuariosListWithSync } from '@/components/admin/usuarios-list-sync'
import { TeamSearch } from '@/components/team-search'

export default function EquipoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Equipo</h1>
          <p className="text-muted-foreground">
            Administra el equipo de trabajo y contacta con los miembros de LABBE
          </p>
        </div>
        <div className="flex gap-2">
          <InsertarUsuariosButton />
          <Link href="/dashboard/company/equipo/importar-ejecutivos">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Importar Ejecutivos
            </Button>
          </Link>
          <Link href="/dashboard/company/equipo/invitar">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invitar Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="info"
        title="Gestión de Equipo - CRUD de Usuarios"
        description="Administra los usuarios del equipo LABBE. Puedes agregar nuevos usuarios, editar información, eliminar cuentas y contactarlos directamente."
        tips={[
          "Usa 'Insertar 6 Usuarios' para cargar datos de prueba",
          "Edita la información de cada usuario según sea necesario",
          "Elimina usuarios individuales o limpia toda la tabla",
          "Contacta directamente vía email o WhatsApp desde aquí",
          "Busca por nombre, email, cargo o teléfono"
        ]}
      />

      {/* Admin Tools */}
      <div className="grid grid-cols-2 gap-4">
        <CleanupProfilesButton />
        <CleanAllUsersButton />
      </div>

      {/* Users Management */}
      <div>
        <h2 className="text-xl font-bold mb-4">Usuarios de la Empresa</h2>
        <UsuariosListWithSync initialUsers={[]} />
      </div>

      {/* Team Directory */}
      <div>
        <h2 className="text-xl font-bold mb-4">Directorio del Equipo LABBE</h2>
        <TeamSearch />
      </div>
    </div>
  )
}
