import { ProfileForm } from '@/components/profile-form'

export const metadata = {
  title: 'Mi Perfil | Transportes Labbé',
  description: 'Gestiona tu perfil personal',
}

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-[var(--cf-border)] pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
          Cuenta
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
          Mi Perfil
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cf-text-secondary)]">
          Revisa y actualiza los datos personales asociados a tu acceso a ChileFlota.
        </p>
      </header>

      <ProfileForm />
    </div>
  )
}
