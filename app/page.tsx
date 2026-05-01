"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, AlertCircle, Shield, Zap, Truck, HardHat, Wrench, Package, Building2, ClipboardCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-500" />
            DocuFleet
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">Características</a>
            <a href="#cases" className="text-slate-300 hover:text-white transition">Casos de Uso</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Precios</a>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Ingresar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Compliance Documental con IA para Chile</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Nunca más un vehículo detenido por documentos vencidos
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            DocuFleet es la capa inteligente de cumplimiento documental para flotas, contratistas y transporte en Chile. Centraliza documentos, detecta vencimientos, y genera evidencia lista para auditorías.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                Comenzar ahora <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Ver demo
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">El dolor que vemos en Chile</h2>
            <p className="text-slate-300 text-lg">Empresas de transporte, logística y construcción pierden dinero y tiempo por gestión manual de documentos</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Documentos Vencidos</h3>
              <p className="text-slate-300 text-sm">Revisión técnica, permiso de circulación, SOAP, certificados. Una carpeta incompleta = multa y operación detenida.</p>
            </div>
            
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Mandantes Exigentes</h3>
              <p className="text-slate-300 text-sm">Contratistas que piden carpetas documentales actualizadas, auditorías frecuentes y trazabilidad completa.</p>
            </div>
            
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Gestión Manual</h3>
              <p className="text-slate-300 text-sm">Excel, carpetas, WhatsApp, correos. Sin automatización, sin alertas, sin control centralizado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cómo funciona DocuFleet</h2>
            <p className="text-slate-300 text-lg">En 4 pasos simples, compliance documental al control</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Subir Documentos", desc: "Conductores suben documentos directamente desde el dashboard" },
              { num: "2", title: "IA Detecta Tipo", desc: "Nuestra IA clasifica automáticamente: RT, permiso, SOAP, certificados" },
              { num: "3", title: "Extrae Vencimiento", desc: "Extrae fechas automáticamente del documento" },
              { num: "4", title: "Alertas Automáticas", desc: "Alertas 30, 15 y 5 días antes del vencimiento" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center h-full">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-300 text-sm">{step.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-orange-500/30" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Módulos y Características</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Gestión de Vehículos</h3>
                  <p className="text-slate-300 text-sm">Matriz completa por patente con documentos requeridos y estado</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Gestión de Conductores</h3>
                  <p className="text-slate-300 text-sm">Carpetas digitales por conductor con licencia, certificados y documentación</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Alertas Inteligentes</h3>
                  <p className="text-slate-300 text-sm">Notificaciones automáticas antes de vencimientos críticos</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Exportación de Carpetas</h3>
                  <p className="text-slate-300 text-sm">Genera carpetas documentales lisas para mandantes e inspecciones</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Reportes Auditables</h3>
                  <p className="text-slate-300 text-sm">Evidencia completa de documentos, fechas y cumplimiento</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Gestión de Contratistas</h3>
                  <p className="text-slate-300 text-sm">Control documental de subcontratistas y personal externo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="cases" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Casos de Uso en Chile</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Truck className="w-8 h-8 text-orange-400" />, title: "Empresa de Transporte de Carga", desc: "Control de vencimientos de flota completa, carpetas para mandantes" },
              { icon: <HardHat className="w-8 h-8 text-orange-400" />, title: "Contratista Minero", desc: "Documentacion de personal, seguridad laboral, cumplimiento regulatorio" },
              { icon: <Wrench className="w-8 h-8 text-orange-400" />, title: "Flota de Servicios Tecnicos", desc: "Vehiculos asignados a tecnicos con documentacion centralizada" },
              { icon: <Package className="w-8 h-8 text-orange-400" />, title: "Operador Logistico", desc: "Gestion de conductores propios y subcontratados" },
              { icon: <Building2 className="w-8 h-8 text-orange-400" />, title: "Empresa Construccion", desc: "Control de equipos, vehiculos y personal de obra" },
              { icon: <ClipboardCheck className="w-8 h-8 text-orange-400" />, title: "Mandante Exigente", desc: "Auditoria de compliance de contratistas y proveedores" }
            ].map((useCase, i) => (
              <div key={i} className="p-6 bg-slate-800/30 border border-slate-700 rounded-lg">
                <div className="mb-3">{useCase.icon}</div>
                <h3 className="font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-slate-300 text-sm">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Excel vs DocuFleet</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /> Con Excel / Gestion Manual</h3>
              <ul className="space-y-3">
                {[
                  "Vencimientos por descuido",
                  "Sin automatización de alertas",
                  "Documentos dispersos",
                  "Difícil auditoría y trazabilidad",
                  "Errores humanos frecuentes",
                  "Tiempo manual en búsquedas"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300">
                    <span className="text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-6 text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /> Con DocuFleet</h3>
              <ul className="space-y-3">
                {[
                  "Alertas automáticas antes de vencer",
                  "IA detecta documentos automáticamente",
                  "Carpeta centralizada y segura",
                  "Reportes listos para auditorías",
                  "Cero errores en vencimientos",
                  "Búsqueda y exportación al instante"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Planes Simples</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Desde 3 UF",
                features: ["Hasta 10 vehículos", "Hasta 5 conductores", "Alertas básicas", "1 usuario"]
              },
              {
                name: "Professional",
                price: "Desde 8 UF",
                features: ["Hasta 50 vehículos", "Hasta 20 conductores", "Alertas avanzadas", "5 usuarios", "Reportes personalizados"],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "A medida",
                features: ["Flotas ilimitadas", "Usuarios ilimitados", "Integración API", "Soporte dedicado", "Customización completa"]
              }
            ].map((plan, i) => (
              <div key={i} className={`p-8 rounded-lg border ${
                plan.highlighted
                  ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950"
                  : "border-slate-700 bg-slate-800/30"
              }`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-orange-400 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${
                  plan.highlighted
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}>
                  Comenzar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-500/10 border-t border-orange-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            ¿Listo para tomar control?
          </h2>
          <p className="text-xl text-slate-300">
            Agendar una demo gratuita o comenzar con DocuFleet hoy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                Acceder al Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-white flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-500" />
                DocuFleet
              </div>
              <p className="text-slate-400 text-sm">Compliance documental con IA para flotas en Chile</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Precios</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2024 DocuFleet. Todos los derechos reservados.</p>
            <p>Compliance documental con IA para Chile</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
