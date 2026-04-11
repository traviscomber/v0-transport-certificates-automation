"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir directamente al dashboard
    router.push('/dashboard/company')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <p className="text-white text-xl">Redirigiendo...</p>
    </div>
  )
}
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Transportes Labbe</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/auth/login-company" className="text-slate-300 hover:text-white transition">
              Login Empresa
            </Link>
            <Link href="/auth/login" className="text-slate-300 hover:text-white transition">
              Login Individual
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6">Portal de Empresas Transportistas</h1>
          <p className="text-xl text-slate-300 mb-8">
            Gestiona tus certificados, documentos y permisos en un solo lugar con seguridad y eficiencia
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/login-company">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                Iniciar Sesión <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="border border-slate-500 hover:border-slate-300 text-white px-8 py-3 rounded-lg font-semibold transition">
                Acceso Individual
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">99%</div>
          <p className="text-slate-300">Precisión en validación</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">35+</div>
          <p className="text-slate-300">Documentos soportados</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">Instant</div>
          <p className="text-slate-300">Procesamiento con IA</p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Características</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <FileCheck className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Documentos Organizados</h3>
            <p className="text-slate-300">Centraliza todos tus documentos en un portal seguro</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <Shield className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Seguridad Avanzada</h3>
            <p className="text-slate-300">Encriptación de datos y autenticación segura</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <Clock className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Acceso 24/7</h3>
            <p className="text-slate-300">Consulta tus documentos en cualquier momento</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20 bg-slate-800/50 rounded-lg">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Beneficios</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Gestión Simplificada</h3>
              <p className="text-slate-300">Reduce tiempos de gestión de permisos</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Conformidad Legal</h3>
              <p className="text-slate-300">Cumple con requisitos normativos</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Soporte Técnico</h3>
              <p className="text-slate-300">Equipo disponible para ayudarte</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Alertas Automáticas</h3>
              <p className="text-slate-300">Notificaciones de vencimientos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">¿Listo para comenzar?</h2>
        <p className="text-xl text-slate-300 mb-8">Accede a tu portal y gestiona tus documentos de forma segura</p>
        <Link href="/auth/login-company">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition">
            Iniciar Sesión
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 Transportes Labbe. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
