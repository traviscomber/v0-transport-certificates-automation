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
  const cookieStore = await cookies()
  const companyId = cookieStore.get('company_id')?.value

  if (!companyId) {
    return null
  }

  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
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
