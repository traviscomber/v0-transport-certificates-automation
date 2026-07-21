import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function ConductorCredentialsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-orange-500/30 bg-slate-900/80 p-8 shadow-2xl shadow-orange-950/30">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10">
          <ShieldAlert className="h-7 w-7 text-orange-300" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
          Acceso restringido
        </p>
        <h1 className="mb-4 text-3xl font-bold text-white">
          Las credenciales de conductores no se publican en el sitio.
        </h1>
        <p className="mb-6 text-slate-300">
          Por seguridad, esta vista ya no muestra contrasenas, formulas de acceso ni archivos descargables.
          La gestion de accesos debe hacerse desde los flujos administrativos autenticados.
        </p>

        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">Accion recomendada</p>
          <p className="mt-1">
            Usa el panel de administracion para crear o regenerar accesos de forma controlada, sin exponer datos
            sensibles en paginas publicas.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/company/conductores"
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Ir a conductores
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  )
}
