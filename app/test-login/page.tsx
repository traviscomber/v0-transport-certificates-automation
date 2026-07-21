import Link from 'next/link'

export default function TestLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
          Prueba deshabilitada
        </p>
        <h1 className="mb-4 text-3xl font-bold">Esta pagina ya no ejecuta logins de prueba.</h1>
        <p className="mb-6 text-slate-300">
          Las credenciales de prueba fueron removidas para evitar exposicion de datos sensibles en produccion.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Ir al login
        </Link>
      </section>
    </main>
  )
}
