'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, CheckCircle, Users, Shield, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

export default function MiningLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <span className="font-bold text-white">La Patagua Mining</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10">
              Solicitar Demo
            </Button>
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="text-orange-400 text-sm font-semibold">MOCKUP - Plataforma especializada en minería</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Gestión integral de <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">personal y compliance</span> para contratistas mineros
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Documentación centralizada, auditoría de seguridad laboral y cumplimiento regulatorio automático para operaciones mineras
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg">
              Ver demo
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-20 rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg h-64 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Dashboard mockup - MOCKUP SOLAMENTE</p>
          </div>
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Casos de Uso en Minería</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: 'Contratista Minero',
              desc: 'Documentación de personal, seguridad laboral, cumplimiento regulatorio'
            },
            {
              icon: Shield,
              title: 'Empresa Operadora',
              desc: 'Control de equipos, vehículos y personal con auditoría centralizada'
            },
            {
              icon: Users,
              title: 'Trabajadores',
              desc: 'Plataforma personal para carga de documentos y certificaciones'
            },
            {
              icon: FileText,
              title: 'Gestor de Documentos',
              desc: 'Validación y aprobación de documentos en tiempo real'
            },
            {
              icon: TrendingUp,
              title: 'Análisis Compliance',
              desc: 'Reportes de cumplimiento y auditoría regulatoria'
            },
            {
              icon: CheckCircle,
              title: 'Verificación de Antecedentes',
              desc: 'Certificación de antecedentes y licencias vigentes'
            }
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6 hover:border-orange-500/50 transition-all">
              <item.icon className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-300 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing mockup */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Planes de precios (Mockup)</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Startups', price: '$29', features: ['Hasta 50 trabajadores', 'Documentación básica', 'Soporte email'] },
            { name: 'Empresas', price: '$99', popular: true, features: ['Hasta 500 trabajadores', 'Compliance completo', 'Reportes avanzados', 'Soporte prioritario'] },
            { name: 'Minería', price: 'Contacta', features: ['Solución a medida', 'Integración API', 'Soporte 24/7', 'Multi-site'] }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-lg border p-8 space-y-6 ${plan.popular 
                ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/50 ring-2 ring-orange-500/20' 
                : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              {plan.popular && <div className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500 rounded-full text-orange-400 text-xs font-semibold">Popular</div>}
              <div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-3xl font-bold text-orange-500 mt-2">{plan.price}</p>
              </div>
              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className={plan.popular ? 'w-full bg-orange-500 hover:bg-orange-600 text-white' : 'w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10'} variant={plan.popular ? 'default' : 'outline'}>
                {plan.popular ? 'Comenzar' : 'Contactar'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-slate-800/50 p-12 space-y-6">
          <h2 className="text-4xl font-bold text-white">¿Listo para optimizar tu operación?</h2>
          <p className="text-lg text-slate-300">Este es un mockup de demostración. Los datos mostrados son de prueba.</p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
              Solicitar demo
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8">
              Contactar ventas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 La Patagua. Todos los derechos reservados. MOCKUP SOLAMENTE.</p>
        </div>
      </footer>
    </div>
  )
}
