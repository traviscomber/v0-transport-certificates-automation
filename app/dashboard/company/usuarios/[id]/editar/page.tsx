import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { UserForm } from '@/components/admin/user-form'
import { notFound } from 'next/navigation'

interface PageParams {
  params: {
    id: string
  }
}

async function getCompanyUser(id: string) {
  const supabase = await createClient()
  
  // Simply fetch the user by ID - no company_id filter since column doesn't exist
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    return null
  }

  return user
}

export async function generateMetadata({ params }: PageParams) {
  const user = await getCompanyUser(params.id)
  
  return {
    title: user ? `Editar ${user.full_name}` : 'Usuario no encontrado',
  }
}

export default async function EditarUsuarioPage({ params }: PageParams) {
  const user = await getCompanyUser(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
        <p className="text-muted-foreground">
          Actualiza la información del usuario {user.full_name}
        </p>
      </div>

      <UserForm user={user} isCompanyContext={true} />
    </div>
  )
}
