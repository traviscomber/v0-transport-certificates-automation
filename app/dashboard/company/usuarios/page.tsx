import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { HelpBox } from '@/components/ui/help-box'
import { UserListClient } from '@/components/admin/user-list-client'

async function getCompanyUsers() {
  const cookieStore = await cookies()
  const companyId = cookieStore.get('company_id')?.value

  if (!companyId) {
    return []
  }

  const supabase = await createClient()
  
  // Get the organization ID for this company
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', companyId)
    .single()

  if (!org) {
    return []
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', org.id)
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

      <UserListClient users={users} isCompanyContext={true} />
    </div>
  )
}
