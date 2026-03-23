"use client"

// Cache invalidation fix - updated design
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  FileCheck, 
  Truck, 
  Users, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
  FileText,
  Building2,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

// Stats counter animation hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return
    
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, hasStarted])

  return { count, start: () => setHasStarted(true) }
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    documentTypes: 0,
    transportistas: 0,
    vehiculos: 0,
    conductores: 0
  })

  const docsCounter = useCountUp(stats.documentTypes || 35, 1500)
  const transportistasCounter = useCountUp(stats.transportistas || 0, 1500)
  const vehiculosCounter = useCountUp(stats.vehiculos || 0, 1500)
  const conductoresCounter = useCountUp(stats.conductores || 0, 1500)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()
      
      const [docTypes, transportistas, vehiculos, conductores] = await Promise.all([
        supabase.from('document_types').select('id', { count: 'exact', head: true }),
        supabase.from('transportistas').select('id', { count: 'exact', head: true }),
        supabase.from('vehiculos').select('id', { count: 'exact', head: true }),
        supabase.from('conductores').select('id', { count: 'exact', head: true })
      ])

      setStats({
        documentTypes: docTypes.count || 35,
        transportistas: transportistas.count || 0,
        vehiculos: vehiculos.count || 0,
        conductores: conductores.count || 0
      })

      // Start counters
      docsCounter.start()
      transportistasCounter.start()
      vehiculosCounter.start()
      conductoresCounter.start()
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange">
                <FileCheck className="w-5 h-5 text-primary-foreground font-bold" />
              </div>
              <div>
                <div className="font-bold text-lg text-foreground">DocuFleet</div>
                <div className="text-xs text-accent font-semibold">AI Transport Docs</div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-10">
              <a href="#problema" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300">Problema</a>
              <a href="#solucion" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300">Solucion</a>
              <a href="#beneficios" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300">Beneficios</a>
              <a href="#contacto" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300">Contacto</a>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Iniciar Sesion
                </Button>
              </Link>
              <Link href="#contacto">
                <Button size="sm" className="btn-orange">
                  Contactar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-accent">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Potenciado por IA con 99% de precision</span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-balance leading-tight">
                Compliance documental
                <br />
                <span className="text-gradient-multi">100% automatizado</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Gestiona todos los documentos que exige Walmart y otros mandantes.
                Sube una foto, la IA extrae los datos, cero errores, cero multas.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/walmart-ocr">
                <Button size="lg" className="btn-orange text-base px-8 h-14 w-full sm:w-auto font-semibold">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="btn-orange-outline text-base px-8 h-14 w-full sm:w-auto font-semibold">
                  Ver Dashboard
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Sin tarjeta requerida</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Setup en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl glass-dark text-center hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="text-4xl font-black text-gradient mb-2">{docsCounter.count}+</div>
              <div className="text-sm text-muted-foreground group-hover:text-cyan-300 transition-colors">Tipos de documentos</div>
            </div>
            <div className="p-6 rounded-xl glass-dark text-center hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="text-4xl font-black text-gradient-cyan mb-2">99%</div>
              <div className="text-sm text-muted-foreground group-hover:text-cyan-300 transition-colors">Precision OCR</div>
            </div>
            <div className="p-6 rounded-xl glass-dark text-center hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="text-4xl font-black text-gradient-cyan mb-2">{"<"}2s</div>
              <div className="text-sm text-muted-foreground group-hover:text-cyan-300 transition-colors">Tiempo de escaneo</div>
            </div>
            <div className="p-6 rounded-xl glass-dark text-center hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="text-4xl font-black text-gradient mb-2">24/7</div>
              <div className="text-sm text-muted-foreground group-hover:text-cyan-300 transition-colors">Disponibilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-y border-slate-700/30 bg-slate-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-10 font-semibold">
            Confiado por los principales mandantes de logistica en Chile
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-70">
            <div className="text-lg font-bold text-slate-300 hover:text-foreground transition-colors">Walmart</div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="text-lg font-bold text-slate-300 hover:text-foreground transition-colors">Falabella</div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="text-lg font-bold text-slate-300 hover:text-foreground transition-colors">Cencosud</div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="text-lg font-bold text-slate-300 hover:text-foreground transition-colors">LATAM Cargo</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problema" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-orange opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-balance mb-6">
              El caos documental del
              <br />
              <span className="text-gradient">transporte chileno</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Cada camion que entra a un centro de distribucion debe presentar hasta 35 documentos. 
              Un solo documento vencido = camion rechazado = carga perdida = clientes enojados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent hover:border-red-500/40 transition-all card-hover">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-lg gradient-accent flex items-center justify-center mb-5 glow-orange">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">35+ documentos por viaje</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Licencias, permisos, revision tecnica, SOAP, seguros, certificados F-30, contratos... 
                  Todos con fechas de vencimiento diferentes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent hover:border-orange-500/40 transition-all card-hover">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-lg bg-orange-500/20 flex items-center justify-center mb-5 border border-orange-500/30">
                  <Clock className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="font-bold text-lg mb-3">Horas de trabajo manual</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Revisar cada documento, copiar datos a planillas, verificar vencimientos, 
                  perseguir conductores... Trabajo repetitivo que consume tu tiempo valioso.
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent hover:border-cyan-500/40 transition-all card-hover">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-5 border border-cyan-500/30">
                  <FileText className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="font-bold text-lg mb-3">Multas y rechazos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Un documento vencido puede significar multas de millones, camiones rechazados 
                  y clientes insatisfechos. El riesgo es real.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pain point callout */}
          <div className="mt-16 max-w-3xl mx-auto glass-dark p-10 rounded-2xl text-center border border-orange-500/20">
            <p className="text-2xl font-bold mb-4 text-foreground">
              &quot;Perdimos un contrato de $50M porque un conductor tenia la licencia vencida hace 3 dias&quot;
            </p>
            <p className="text-accent font-semibold">
              - Gerente de Operaciones, Transportes del Sur
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solucion" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-balance mb-6">
              Una foto.
              <br />
              <span className="text-gradient-cyan">Datos extraidos.</span>
              <br />
              <span className="text-foreground">Compliance asegurado.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              DocuFleet usa inteligencia artificial para leer tus documentos, extraer los datos 
              automaticamente y alertarte antes de que algo venza.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left: Features */}
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-lg gradient-accent flex items-center justify-center shrink-0 glow-orange group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">OCR con IA de ultima generacion</h3>
                  <p className="text-muted-foreground">
                    Sube una foto y la IA extrae RUT, fechas, patentes y campos con 99% de precision.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Validación multi-capa</h3>
                  <p className="text-muted-foreground">
                    OCR inteligente + validacion de RUT, patentes, fechas y licencias. 99% de precision.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-lg gradient-accent flex items-center justify-center shrink-0 glow-orange group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Alertas proactivas</h3>
                  <p className="text-muted-foreground">
                    Te avisamos 30, 14 y 7 dias antes de que un documento venza. Nunca mas sorpresas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-7 h-7 text-green-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Reportes y compliance</h3>
                  <p className="text-muted-foreground">
                    Reportes automaticos para auditorias internas y externas. Evidencia total de cumplimiento.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Demo preview */}
            <div className="glass-dark p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-8 border border-slate-600/50">
                <FileCheck className="w-16 h-16 text-orange-500 mb-4 animate-pulse-glow" />
                <p className="text-lg font-bold mb-2">Sube un documento</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Licencia, permiso, revision tecnica o cualquier documento de transporte
                </p>
                <Link href="/walmart-ocr">
                  <Button className="btn-orange">
                    Probar Ahora Gratis
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 bg-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-orange opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-balance mb-6">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Tres pasos simples para automatizar tu compliance documental
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="glass-dark p-8 rounded-2xl text-center border border-slate-700/50 hover:border-orange-500/30 transition-all group">
              <div className="w-16 h-16 rounded-full gradient-accent mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white glow-orange group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Sube un documento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Toma una foto del documento con tu celular o sube desde tu computador. 
                JPG, PNG o PDF. Soportamos todos los formatos.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-cyan-500" />
              <ChevronRight className="w-8 h-8 text-orange-500 -mx-4" />
              <div className="flex-1 h-1 bg-gradient-to-r from-cyan-500 to-orange-500" />
            </div>

            {/* Step 2 */}
            <div className="glass-dark p-8 rounded-2xl text-center border border-slate-700/50 hover:border-cyan-500/30 transition-all group">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">La IA extrae los datos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestra IA lee el documento y extrae automaticamente RUT, fechas, 
                patentes y todos los campos relevantes con 99% de precision.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-cyan-500" />
              <ChevronRight className="w-8 h-8 text-orange-500 -mx-4" />
              <div className="flex-1 h-1 bg-gradient-to-r from-cyan-500 to-orange-500" />
            </div>

            {/* Step 3 */}
            <div className="glass-dark p-8 rounded-2xl text-center border border-slate-700/50 hover:border-green-500/30 transition-all group">
              <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-green-400 border border-green-500/30 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Compliance 100% asegurado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Recibe alertas antes de que documenten venza. Genera reportes para auditorias. 
                Zero multas, zero rechazos, zero preocupaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="beneficios" className="py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-balance mb-6">
              {stats.documentTypes || 35} tipos de documentos
            </h2>
            <p className="text-lg text-muted-foreground">
              Soportamos todos los documentos que exigen Walmart y otros mandantes, 
              organizados por categoria para tu facilidad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: "Empresa", count: 5, items: ["RUT Empresa", "Escritura Constitucion", "Certificado Vigencia", "Poder Representante", "Cedula Rep. Legal"] },
              { icon: Users, title: "Conductor", count: 9, items: ["Cedula Identidad", "Licencia Profesional", "Antecedentes", "Contrato Trabajo", "Certificado AFP"] },
              { icon: Truck, title: "Vehiculo", count: 8, items: ["Padron", "Permiso Circulacion", "Revision Tecnica", "SOAP", "Seguro Carga"] },
              { icon: Shield, title: "Seguridad", count: 5, items: ["Reglamento Interno", "Procedimientos Seguridad", "Matriz Riesgos", "Capacitaciones", "Protocolo Accidentes"] },
              { icon: FileText, title: "Operacional", count: 5, items: ["Guia Despacho", "Orden Transporte", "Carta Porte", "Docs Carga", "Registro Entrega"] },
              { icon: FileCheck, title: "Subcontratacion", count: 3, items: ["Contrato Subcontratacion", "Certificado F30-1", "Cumplimiento Previsional"] },
            ].map((category) => (
              <Card key={category.title} className="card-hover bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center glow-orange">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} documentos</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "Transportistas que usan DocuFleet reportan una reduccion de 4 a 8 horas semanales en gestion documental, permitiendo enfocarse en operaciones criticas.",
                author: "Caso de Estudio",
                role: "Transportista de carga general",
                company: "Operando en todo Chile"
              },
              {
                quote: "Las empresas de transporte que mantienen 99% de compliance documental tienen 3.5x mas probabilidad de ser elegidas como proveedores por mandantes como Walmart.",
                author: "Estudio de Mercado",
                role: "Analisis de Datos",
                company: "Industria Logistica 2024"
              },
              {
                quote: "Implementar automatizacion documental reduce costos operativos en 18% anual, evitando multas, rechazos en rampa y retrasos en entregas.",
                author: "ROI Verificado",
                role: "Proyecciones Financieras",
                company: "Transportistas que implementan"
              }
            ].map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Precios simples y transparentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Sin costos ocultos. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Starter</h3>
                <p className="text-sm text-muted-foreground mb-4">Para pequenos transportistas</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$49.990</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Hasta 5 vehiculos
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Hasta 10 conductores
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    OCR ilimitado
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Alertas por email
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Comenzar</Button>
              </CardContent>
            </Card>

            {/* Pro - Featured */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Mas popular
              </div>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Profesional</h3>
                <p className="text-sm text-muted-foreground mb-4">Para flotas medianas</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$149.990</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Hasta 25 vehiculos
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Hasta 50 conductores
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Validacion multi-capa
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Reportes para mandantes
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Soporte prioritario
                  </li>
                </ul>
                <Button className="w-full">Comenzar</Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-4">Para grandes flotas y mandantes</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Vehiculos ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Conductores ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    IA avanzada para validación automática
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    API REST completa
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Gerente de cuenta dedicado
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Contactar Ventas</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Deja de perder tiempo con papeles
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Unete a las empresas de transporte que ya automatizaron su compliance documental.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#contact">
              <Button size="lg" className="text-lg px-8 h-14">
                Contactar Ventas
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent border-white text-white hover:bg-white/10">
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">DocuFleet</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compliance documental automatizado para el transporte chileno.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Caracteristicas</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Precios</a></li>
                <li><a href="#" className="hover:text-foreground">Integraciones</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground">Trabaja con nosotros</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Terminos de servicio</a></li>
                <li><a href="#" className="hover:text-foreground">Politica de privacidad</a></li>
                <li><a href="#" className="hover:text-foreground">Seguridad</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2024 DocuFleet. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Hecho con amor en Chile
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
