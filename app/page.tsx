"use client"

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">DocuFleet</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#problema" className="text-sm text-muted-foreground hover:text-foreground transition-colors">El Problema</a>
              <a href="#solucion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solucion</a>
              <a href="#documentos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentos</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Precios</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">Iniciar Sesion</Button>
              </Link>
              <Link href="#contact">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Contactar Ventas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 gradient-mesh" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Potenciado por IA con 99% de precision</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Compliance documental
              <br />
              <span className="text-gradient">100% automatizado</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Gestiona los {stats.documentTypes || 35} documentos que exige Walmart y otros mandantes. 
              Sube una foto, la IA extrae los datos. Cero errores, cero multas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/walmart-ocr">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 h-14">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Ver Dashboard
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Setup en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Soporte incluido</span>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{docsCounter.count}+</div>
              <div className="text-sm text-muted-foreground mt-1">Tipos de documentos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">99%</div>
              <div className="text-sm text-muted-foreground mt-1">Precision OCR</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{"<"}2s</div>
              <div className="text-sm text-muted-foreground mt-1">Tiempo de analisis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">0</div>
              <div className="text-sm text-muted-foreground mt-1">Multas con DocuFleet</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Los mayores mandantes de logistica en Chile confian en soluciones como DocuFleet
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            <div className="text-2xl font-bold">Walmart</div>
            <div className="text-2xl font-bold">Falabella</div>
            <div className="text-2xl font-bold">Cencosud</div>
            <div className="text-2xl font-bold">SMU</div>
            <div className="text-2xl font-bold">LATAM Cargo</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problema" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              El caos documental del transporte chileno
            </h2>
            <p className="text-lg text-muted-foreground">
              Cada camion que entra a un centro de distribucion debe presentar hasta 35 documentos. 
              Un solo documento vencido = camion rechazado = carga perdida.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">35+ documentos por viaje</h3>
                <p className="text-muted-foreground text-sm">
                  Licencias, permisos de circulacion, revision tecnica, SOAP, seguros, certificados F-30, 
                  contratos... Todos con fechas de vencimiento diferentes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Horas de trabajo manual</h3>
                <p className="text-muted-foreground text-sm">
                  Revisar cada documento, copiar datos a planillas, verificar vencimientos, 
                  perseguir conductores... Trabajo repetitivo que consume tu tiempo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Multas y rechazos</h3>
                <p className="text-muted-foreground text-sm">
                  Un documento vencido que se te paso puede significar multas de millones, 
                  camiones rechazados en rampa y clientes insatisfechos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pain point callout */}
          <div className="mt-16 max-w-3xl mx-auto bg-muted/50 rounded-2xl p-8 text-center">
            <p className="text-2xl font-medium mb-4">
              &ldquo;Perdimos un contrato de $50M porque un conductor tenia la licencia vencida hace 3 dias&rdquo;
            </p>
            <p className="text-muted-foreground">
              - Gerente de Operaciones, Transportes del Sur
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solucion" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Una foto. Datos extraidos. Compliance asegurado.
            </h2>
            <p className="text-lg text-muted-foreground">
              DocuFleet usa inteligencia artificial para leer tus documentos, extraer los datos 
              automaticamente y alertarte antes de que algo venza.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Features */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">OCR con IA de ultima generacion</h3>
                  <p className="text-muted-foreground">
                    Sube una foto del documento y la IA extrae RUT, fechas, patentes y todos los campos relevantes con 99% de precision.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Validación multi-capa</h3>
                  <p className="text-muted-foreground">
                    OCR inteligente + validación completa de RUT, patentes, fechas y licencias. 99% de precisión sin depender de terceros.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Alertas proactivas</h3>
                  <p className="text-muted-foreground">
                    Te avisamos 30, 14 y 7 dias antes de que un documento venza. Nunca mas un rechazo por sorpresa.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Reportes para Walmart y mandantes</h3>
                  <p className="text-muted-foreground">
                    Genera reportes de compliance en 1 click. Exporta a Excel o PDF para auditorias.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Demo preview */}
            <div className="bg-card rounded-2xl border shadow-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <FileCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Sube un documento</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Licencia, permiso, revision tecnica...
                  </p>
                  <Link href="#contact">
                    <Button>
                      Solicitar Demo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documentos" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {stats.documentTypes || 35} tipos de documentos soportados
            </h2>
            <p className="text-lg text-muted-foreground">
              Todos los documentos que exige Walmart y otros mandantes, organizados por categoria.
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
              <Card key={category.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
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
