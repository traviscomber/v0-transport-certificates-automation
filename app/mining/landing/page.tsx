'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, CheckCircle, Users, Shield, TrendingUp, FileText, Zap, Award, Clock, AlertCircle, BarChart3, Lock } from 'lucide-react'
import Link from 'next/link'

export default function MiningLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-primary/20 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">LP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">La Patagua</span>
              <span className="text-xs text-muted-foreground">Soluciones Mineras</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              Características
            </Button>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              Precios
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-background">
              Solicitar Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex px-4 py-2 bg-primary/10 border border-primary/20 rounded-full items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-semibold">Plataforma especializada en minería</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Compliance integral para operaciones mineras
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Automatiza la gestión de documentos, seguridad laboral y cumplimiento regulatorio. Reduce multas, optimiza operaciones y garantiza auditoría 24/7.
            </p>

            <div className="grid grid-cols-3 gap-6 py-6 border-y border-secondary">
              <div>
                <p className="text-2xl font-bold text-primary">99%</p>
                <p className="text-sm text-muted-foreground">Precisión en validación</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">8x</p>
                <p className="text-sm text-muted-foreground">Más rápido que manual</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">CLP $2,5M</p>
                <p className="text-sm text-muted-foreground">Ahorro anual promedio</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-background px-8 py-6 text-lg" size="lg">
                Solicitar Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-secondary text-foreground hover:bg-secondary px-8 py-6 text-lg" size="lg">
                Ver características
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">✓ Sin tarjeta de crédito • ✓ Demo en 15 minutos • ✓ Soporte inmediato</p>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="rounded-2xl border border-secondary/50 bg-secondary/20 p-8 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-16 w-16 text-primary/50 mx-auto" />
                  <p className="text-muted-foreground">Dashboard de control en tiempo real</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="max-w-7xl mx-auto px-4 py-24 bg-secondary/30 rounded-3xl border border-secondary/50 my-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Características que marcan la diferencia</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diseñado específicamente para operaciones mineras complejas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Lock,
              title: 'Documentación Centralizada',
              desc: 'Gestiona 35+ tipos de documentos mineros en un solo lugar seguro'
            },
            {
              icon: Zap,
              title: 'Validación con IA',
              desc: 'Análisis instantáneo con 99% de precisión, sin errores manuales'
            },
            {
              icon: Shield,
              title: 'Cumplimiento Normativo',
              desc: 'Auditoría automática según regulaciones de minería (ChileARA, ISO, etc.)'
            },
            {
              icon: Clock,
              title: 'Procesamiento 24/7',
              desc: 'Sistema activo permanentemente, sin interrupciones operacionales'
            },
            {
              icon: BarChart3,
              title: 'Reportes Ejecutivos',
              desc: 'Dashboards en tiempo real para toma de decisiones inmediata'
            },
            {
              icon: Award,
              title: 'Auditoría Completa',
              desc: 'Trazabilidad total de cambios, cumplidor de regulaciones fiscales'
            }
          ].map((feature, i) => (
            <div key={i} className="rounded-xl bg-background border border-secondary/50 p-6 hover:border-primary/50 transition-all group">
              <feature.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Soluciones para cada rol</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada usuario tiene herramientas diseñadas para su trabajo específico
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Briefcase,
              title: 'Para Contratistas',
              features: ['Gestión centralizada de personal', 'Monitoreo de cumplimiento regulatorio', 'Integración con SAP/ERP']
            },
            {
              icon: Users,
              title: 'Para Trabajadores',
              features: ['Carga simple de documentos', 'Seguimiento del estatus', 'Notificaciones automáticas']
            },
            {
              icon: Shield,
              title: 'Para Operadores',
              features: ['Auditoría multi-sitio', 'Reportes de compliance', 'Control de acceso']
            },
            {
              icon: FileText,
              title: 'Para Gestores',
              features: ['Validación en tiempo real', 'Flujos de aprobación', 'Integración con IA']
            },
            {
              icon: BarChart3,
              title: 'Para Ejecutivos',
              features: ['Dashboards de KPI', 'ROI tracking', 'Análisis de riesgos']
            },
            {
              icon: CheckCircle,
              title: 'Para Auditores',
              features: ['Trazabilidad completa', 'Reportes certificados', 'Compliance automático']
            }
          ].map((use, i) => (
            <div key={i} className="rounded-xl bg-background border border-secondary/50 p-6 hover:border-primary/50 hover:shadow-lg transition-all">
              <use.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-4">{use.title}</h3>
              <ul className="space-y-2">
                {use.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: '235+', label: 'Empresas activas' },
            { number: '12,500+', label: 'Usuarios registrados' },
            { number: '1.2M+', label: 'Documentos procesados' },
            { number: '98%', label: 'Satisfacción del cliente' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-primary">{stat.number}</p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Planes diseñados para crecer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde pequeños contratistas hasta operaciones multi-sitio
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Estándar',
              price: 'CLP $2.490.000',
              period: '/mes',
              desc: 'Para pequeños y medianos contratistas',
              features: [
                'Hasta 100 trabajadores',
                'Gestión de documentos básica',
                'Reportes automáticos',
                'Soporte por email',
                'Almacenamiento 100GB'
              ],
              cta: 'Comenzar prueba gratuita'
            },
            {
              name: 'Profesional',
              price: 'CLP $6.990.000',
              period: '/mes',
              desc: 'Para operaciones mineras medianas',
              features: [
                'Hasta 500 trabajadores',
                'Compliance avanzado',
                'Análisis IA incluido',
                'Reportes ejecutivos',
                'Almacenamiento 500GB',
                'Soporte prioritario',
                'Integración API'
              ],
              cta: 'Solicitar demo',
              popular: true
            },
            {
              name: 'Empresa',
              price: 'A medida',
              desc: 'Para grandes operaciones multi-sitio',
              features: [
                'Trabajadores ilimitados',
                'Multi-sitio y multi-empresa',
                'Auditoría 24/7',
                'Integración ERP/SAP',
                'Soporte 24/7',
                'Almacenamiento ilimitado',
                'Consultoría incluida'
              ],
              cta: 'Contactar ventas'
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border p-8 space-y-6 transition-all ${plan.popular 
                ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20 transform scale-105' 
                : 'bg-secondary/30 border-secondary/50 hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full text-primary text-xs font-bold">
                  Más popular
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{plan.desc}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{plan.price}</p>
                {plan.period && <p className="text-muted-foreground text-sm">{plan.period}</p>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={plan.popular ? 'w-full bg-primary hover:bg-primary/90 text-background' : 'w-full border-primary/20 text-foreground hover:bg-secondary'} 
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 space-y-6">
          <h2 className="text-4xl font-bold">Optimiza tu operación minera hoy</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Únete a los líderes de minería que ya usan La Patagua para reducir costos y mejorar cumplimiento.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-primary hover:bg-primary/90 text-background px-8 py-6 text-lg" size="lg">
              Solicitar Demo Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-primary/20 px-8 py-6 text-lg" size="lg">
              Hablar con ventas
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Configuración en 15 minutos • Sin compromisos • Prueba gratuita de 30 días</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/50 bg-secondary/30 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-background font-bold text-xs">LP</span>
                </div>
                <span className="font-bold">La Patagua</span>
              </div>
              <p className="text-sm text-muted-foreground">Soluciones de compliance para minería</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Producto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Características</a></li>
                <li><a href="#" className="hover:text-foreground transition">Precios</a></li>
                <li><a href="#" className="hover:text-foreground transition">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Empresa</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground transition">Trabaja con nosotros</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-foreground transition">Términos</a></li>
                <li><a href="#" className="hover:text-foreground transition">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary/50 pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 La Patagua. Todos los derechos reservados.</p>
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Volver a Transportes
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
