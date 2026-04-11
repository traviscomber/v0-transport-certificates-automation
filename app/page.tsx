"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Transportes Labbe</h1>
        <p className="text-xl text-slate-300 mb-12">Portal de Empresas Transportistas</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/auth/login-company"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          >
            Iniciar Sesión - Empresa
          </Link>
          <Link 
            href="/auth/login"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            Iniciar Sesión - Individual
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-3xl">
          <div className="text-left">
            <div className="text-3xl font-bold text-orange-500 mb-2">99%</div>
            <p className="text-slate-300">Precisión en validación</p>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-orange-500 mb-2">35+</div>
            <p className="text-slate-300">Documentos soportados</p>
          </div>
          <div className="text-left">
            <div className="text-3xl font-bold text-orange-500 mb-2">Instant</div>
            <p className="text-slate-300">Procesamiento con IA</p>
          </div>
        </div>
      </div>
    </main>
  )
}
