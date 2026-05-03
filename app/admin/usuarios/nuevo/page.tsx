import { UserForm } from '@/components/admin/user-form'

export const metadata = {
  title: 'Crear Nuevo Usuario',
  description: 'Crea un nuevo usuario en el sistema',
}

export default function NuevoUsuarioPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
        <p className="text-muted-foreground">
          Completa el formulario para agregar un nuevo usuario al sistema
        </p>
      </div>

      <UserForm isCompanyContext={false} />
    </div>
  )
}
