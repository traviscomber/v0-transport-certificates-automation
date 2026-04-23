import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { HelpBox } from '@/components/ui/help-box'
import { InsertarUsuariosButton } from '@/components/admin/insertar-usuarios-button'
import { CleanupProfilesButton } from '@/components/admin/cleanup-profiles-button'
import { CleanAllUsersButton } from '@/components/admin/clean-all-users-button'
import { UsuariosListWithSync } from '@/components/admin/usuarios-list-sync'

async function getCompanyUsers() {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  return users || []
}

export const metadata = {
  title: 'Gestión de Usuarios - Mi Empresa',
  description: 'Administra los usuarios de tu empresa',
}

export default async function CompanyUsuariosPage() {
  const users = await getCompanyUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios de la Empresa</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios que trabajan en tu empresa
          </p>
        </div>
        <div className="flex gap-2">
          <InsertarUsuariosButton />
          <Link href="/dashboard/company/usuarios/importar-ejecutivos">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Importar Ejecutivos
            </Button>
          </Link>
          <Link href="/dashboard/company/usuarios/invitar">
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
        title="Gestión de Usuarios de Empresa"
        description="Administra los usuarios que acceden a tu portal. Puedes invitar nuevos usuarios, editar su información y eliminarlos de tu empresa."
        tips={[
          "Solo los admin de la empresa pueden invitar nuevos usuarios",
          "Los dispatchers pueden ayudar a gestionar conductores y documentos",
          "Los drivers son tus conductores operacionales",
          "Desactiva usuarios temporalmente en lugar de eliminarlos",
          "Los usuarios recibirán un email para confirmar su cuenta"
        ]}
      />

      <CleanupProfilesButton />

      <CleanAllUsersButton />

      <UsuariosListWithSync initialUsers={users} />
    </div>
  )
}
