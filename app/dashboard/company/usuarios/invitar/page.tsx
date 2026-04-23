import { UserForm } from '@/components/admin/user-form'

export const metadata = {
  title: 'Invitar Usuario',
  description: 'Invita un nuevo usuario a tu empresa',
}

export default function InvitarUsuarioPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Invitar Nuevo Usuario</h1>
        <p className="text-muted-foreground">
          Completa el formulario para invitar un nuevo usuario a tu empresa
        </p>
      </div>

      <UserForm isCompanyContext={true} />
    </div>
  )
}
