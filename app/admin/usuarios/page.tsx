import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { HelpBox } from '@/components/ui/help-box'
import { UserListClient } from '@/components/admin/user-list-client'

async function getAdminUsers() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[v0] No authenticated user')
      return []
    }

    console.log('[v0] Fetching users for authenticated user:', user.id)

    // Use admin client to bypass RLS and get all users
    const adminClient = createAdminClient()
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching users:', error)
      return []
    }

    console.log('[v0] Retrieved users count:', users?.length)
    return users || []
  } catch (error) {
    console.error('[v0] Error in getAdminUsers:', error)
    return []
  }
}

export const metadata = {
  title: 'Gestión de Usuarios',
  description: 'Administra todos los usuarios del sistema',
}

export default async function UsuariosPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Crea, edita y elimina usuarios del sistema
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="info"
        title="Gestión de Usuarios"
        description="Administra todos los usuarios del sistema Labbe. Puedes crear nuevos usuarios, editar información existente y eliminar usuarios cuando sea necesario."
        tips={[
          "Los usuarios admin tienen acceso a todo el sistema",
          "Los dispatchers pueden gestionar conductores y documentos de sus empresas",
          "Los drivers son conductores que operan vehículos",
          "Marca como inactivo para desactivar temporalmente un usuario sin eliminarlo",
          "Al crear un usuario, se envía un email de confirmación automáticamente"
        ]}
      />

      <UserListClient users={users} isCompanyContext={false} />
    </div>
  )
}
