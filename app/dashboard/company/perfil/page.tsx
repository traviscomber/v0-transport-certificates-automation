import { ProfileForm } from '@/components/profile-form'

export const metadata = {
  title: 'Mi Perfil | Transportes Labbé',
  description: 'Gestiona tu perfil personal'
}

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Actualiza tu información personal y foto de perfil
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm />
    </div>
  )
}
