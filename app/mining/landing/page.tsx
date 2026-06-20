'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Shield, TrendingUp, FileText, Zap, Award, Clock, AlertCircle, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'

export default function MiningLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-primary/20 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">SA</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Segur-IA</span>
              <span className="text-xs text-muted-foreground">Powered by N3uralia</span>
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
              Solicitar presentación
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
              <span className="text-primary text-sm font-semibold">Hecho para faenas en Chile</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Menos papeleo. Menos multas. Más faena andando.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Segur-IA centraliza y valida la documentación laboral y de contratistas en minería, con trazabilidad completa y alertas en tiempo real.
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
                Agendar presentación de 15 minutos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-secondary text-foreground hover:bg-secondary px-8 py-6 text-lg" size="lg">
                Ver cómo funciona
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>✓ +235 empresas</span>
              <span>✓ +1,2M documentos procesados</span>
              <span>✓ Soporte local</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="rounded-2xl border border-secondary/50 overflow-hidden shadow-2xl">
              <img 
                src="/images/mining-compliance-hero.jpg" 
                alt="Mining compliance dashboard in operation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain -> Solution Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-secondary/30 rounded-3xl border border-secondary/50 p-12 space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Si un documento falla, toda la operación se frena</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En minería, un vencimiento o rechazo documental puede costar horas, multas y conflictos con mandantes. Segur-IA automatiza el control documental para que tu equipo deje de apagar incendios y vuelva a operar con confianza.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: 'Evita bloqueos por documentación vencida',
                desc: 'Monitoreo automático de fechas y estados para prevenir paradas operacionales'
              },
              {
                icon: Clock,
                title: 'Reduce tiempos de habilitación de personal y empresas',
                desc: 'Validación ágil que acelera el onboarding sin comprometer cumplimiento'
              },
              {
                icon: Award,
                title: 'Llega a auditorías con respaldo completo, en minutos',
                desc: 'Trazabilidad total que convierte auditorías de estrés en confirmación de éxito'
              }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <item.icon className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">No es otro software genérico. Es compliance minero en serio.</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Zap,
              title: 'Validación inteligente con IA',
              desc: 'Detecta errores, vencimientos y faltantes antes de llegar a faena.'
            },
            {
              icon: TrendingUp,
              title: 'Trazabilidad total',
              desc: 'Cada aprobación, rechazo y cambio queda registrado con evidencia.'
            },
            {
              icon: BarChart3,
              title: 'Panel operativo en tiempo real',
              desc: 'Visualiza riesgos por contratista, sitio y estado documental.'
            },
            {
              icon: Users,
              title: 'Flujos por rol',
              desc: 'Operaciones, RRHH, prevención y contratistas trabajando coordinados.'
            }
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-background border border-secondary/50 p-6 hover:border-primary/50 hover:shadow-lg transition-all">
              <item.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo Funciona - 3 Pasos */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Así de simple: 3 pasos y quedas en control</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatización sin complicaciones
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1 - Carga */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-background font-bold text-lg">
                1
              </div>
              <h3 className="text-2xl font-bold">Carga</h3>
              <p className="text-muted-foreground">
                Sube documentos de trabajadores, empresas y equipos.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-secondary/50 shadow-lg">
              <img 
                src="/images/mining-dashboard-overview.jpg" 
                alt="Paso 1: Carga de documentos"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Step 2 - Valida */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-xl overflow-hidden border border-secondary/50 shadow-lg order-2 md:order-1">
              <img 
                src="/images/mining-document-manager.jpg" 
                alt="Paso 2: Validación automática"
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-4 order-1 md:order-2">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-background font-bold text-lg">
                2
              </div>
              <h3 className="text-2xl font-bold">Valida</h3>
              <p className="text-muted-foreground">
                La plataforma revisa requisitos, fechas y consistencia automáticamente.
              </p>
            </div>
          </div>

          {/* Step 3 - Actúa */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-background font-bold text-lg">
                3
              </div>
              <h3 className="text-2xl font-bold">Actúa</h3>
              <p className="text-muted-foreground">
                Aprueba, observa o rechaza con trazabilidad; notificación inmediata.
              </p>
              <p className="text-sm text-muted-foreground pt-4 border-t border-secondary">
                <strong>Resultado:</strong> menos correos, menos Excel, menos urgencias de último minuto.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-secondary/50 shadow-lg">
              <img 
                src="/images/mining-pending-documents.jpg" 
                alt="Paso 3: Aprobación y trazabilidad"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-secondary/30 rounded-3xl border border-secondary/50 p-12 text-center space-y-8">
          <h2 className="text-4xl font-bold">Equipos en Chile ya están operando con menos fricción</h2>
          
          <blockquote className="text-xl text-muted-foreground italic max-w-2xl mx-auto">
            "Antes nos tomaba días preparar auditorías. Hoy en menos de una hora tenemos todo trazado."
          </blockquote>
          
          <p className="text-sm text-muted-foreground font-semibold">
            — Jefatura de Acreditación, empresa contratista en Antofagasta
          </p>
        </div>
      </section>

      {/* Stats */}
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

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 space-y-6">
          <h2 className="text-4xl font-bold">Tu operación no debería depender de planillas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Agenda una presentación y te mostramos en 15 minutos cómo reducir riesgo documental en tu operación.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-primary hover:bg-primary/90 text-background px-8 py-6 text-lg" size="lg">
              Quiero mi presentación
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sin tarjeta de crédito · Implementación guiada · Soporte en Chile
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/50 bg-secondary/30 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-background font-bold text-xs">SA</span>
                </div>
                <span className="font-bold">Segur-IA</span>
              </div>
              <p className="text-sm text-muted-foreground">Soluciones de compliance minero. Desarrollado por Segur-ía y N3uralia</p>
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
            <p>&copy; 2026 Segur-ía y N3uralia. Todos los derechos reservados.</p>
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
