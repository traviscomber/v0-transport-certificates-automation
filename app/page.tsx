"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Truck,
  HardHat,
  Wrench,
  Package,
  Building2,
  ClipboardCheck,
} from "lucide-react"
import Link from "next/link"

const surface = "rounded-[5px] bg-[#181A1D]"
const muted = "text-[#A9ADB3]"

export default function LandingPage() {
  const steps = [
    { num: "01", title: "Subir documentos", desc: "Conductores y empresas cargan documentos desde su flujo operativo." },
    { num: "02", title: "Clasificar", desc: "La IA identifica el tipo documental y organiza la evidencia." },
    { num: "03", title: "Validar", desc: "El sistema extrae fechas, vigencia y señales que requieren revisión." },
    { num: "04", title: "Actuar", desc: "Alertas y estados priorizan renovaciones, observaciones y vencimientos." },
  ]

  const modules = [
    ["Gestión de vehículos", "Matriz por patente con requisitos y estado documental."],
    ["Gestión de conductores", "Carpeta digital por conductor con documentación y vigencia."],
    ["Alertas operacionales", "Señales anticipadas para vencimientos y casos que requieren acción."],
    ["Carpetas auditables", "Evidencia centralizada para mandantes, inspecciones y auditorías."],
    ["Reportes", "Lectura ejecutiva de cumplimiento, riesgo y actividad operacional."],
    ["Subcontratistas", "Control documental de empresas externas, conductores y responsables."],
  ]

  const useCases = [
    { icon: Truck, title: "Transporte de carga", desc: "Control de flota, vigencias y carpetas para mandantes." },
    { icon: HardHat, title: "Contratistas", desc: "Documentación laboral, seguridad y cumplimiento operacional.", href: "/mining/landing" },
    { icon: Wrench, title: "Servicios técnicos", desc: "Vehículos y técnicos con documentación centralizada." },
    { icon: Package, title: "Operadores logísticos", desc: "Conductores propios y subcontratados en una sola operación." },
    { icon: Building2, title: "Construcción", desc: "Control de equipos, vehículos, empresas y personal de obra." },
    { icon: ClipboardCheck, title: "Mandantes", desc: "Revisión de compliance de contratistas y proveedores." },
  ]

  return (
    <div className="min-h-screen bg-[#111214] text-[#F2F0EB]">
      <nav className="fixed top-0 z-50 w-full border-b border-[#303238] bg-[#111214]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-base font-medium tracking-tight">
            <Shield className="h-5 w-5 text-[#9A5968]" />
            ChileFlota
          </div>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm text-[#A9ADB3] transition-colors hover:text-[#F2F0EB]">Producto</a>
            <a href="#cases" className="text-sm text-[#A9ADB3] transition-colors hover:text-[#F2F0EB]">Casos de uso</a>
            <a href="#pricing" className="text-sm text-[#A9ADB3] transition-colors hover:text-[#F2F0EB]">Planes</a>
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-[5px] border-[#454850] bg-transparent text-[#F2F0EB] hover:bg-[#202226]">
                Ingresar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-[5px] bg-[#181A1D] px-3 py-2 text-xs text-[#CBB8BD]">
              <Shield className="h-4 w-4 text-[#9A5968]" />
              Compliance documental y control operacional
            </div>
            <h1 className="mt-7 text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Documentación de flota bajo control, antes de que se convierta en una detención.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#A9ADB3] sm:text-lg">
              ChileFlota centraliza documentos, vigencias, responsables y evidencia para que flotas, transportistas y contratistas operen con una lectura común del cumplimiento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="rounded-[5px] bg-[#742D3D] px-5 text-[#F2F0EB] hover:bg-[#87364A]">
                  Acceder al sistema <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="ghost" className="rounded-[5px] px-5 text-[#C6C8CC] hover:bg-[#202226] hover:text-[#F2F0EB]">
                  Ver cómo funciona
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#303238] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Problema operacional</p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight">El costo aparece cuando la información llega tarde.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[5px] bg-[#303238] md:grid-cols-3">
              {[
                ["Vencimientos", "Una vigencia perdida puede detener un vehículo o bloquear una operación."],
                ["Exigencia documental", "Mandantes y auditorías requieren evidencia actualizada y trazable."],
                ["Fragmentación", "Excel, correo y WhatsApp dificultan saber qué está aprobado, pendiente o vencido."],
              ].map(([title, desc]) => (
                <div key={title} className="bg-[#181A1D] p-5">
                  <AlertCircle className="h-5 w-5 text-[#994550]" />
                  <h3 className="mt-4 text-sm font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A9ADB3]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Flujo ChileFlota</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Un flujo único desde la carga hasta la decisión.</h2>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[5px] bg-[#303238] md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="bg-[#181A1D] p-5">
                <span className="font-mono text-xs text-[#9A5968]">{step.num}</span>
                <h3 className="mt-7 text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#A9ADB3]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Módulos operacionales</h2>
              <p className="mt-3 text-sm leading-6 text-[#A9ADB3]">
                Cada módulo comparte estados, navegación y evidencia para evitar que el cumplimiento se fragmente entre herramientas.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {modules.map(([title, desc]) => (
                <div key={title} className="border-t border-[#303238] pt-4">
                  <Zap className="h-4 w-4 text-[#9A5968]" />
                  <h3 className="mt-3 text-sm font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A9ADB3]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cases" className="border-y border-[#303238] bg-[#181A1D] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Casos de uso</p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight">Una misma disciplina documental para operaciones distintas.</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {useCases.map((useCase) => {
              const Icon = useCase.icon
              const content = (
                <div className={`${surface} h-full p-5 transition-colors hover:bg-[#202226]`}>
                  <Icon className="h-5 w-5 text-[#9A5968]" />
                  <h3 className="mt-5 text-sm font-medium">{useCase.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A9ADB3]">{useCase.desc}</p>
                </div>
              )
              return useCase.href ? <Link key={useCase.title} href={useCase.href}>{content}</Link> : <div key={useCase.title}>{content}</div>
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Sin sistema común</p>
              <h2 className="mt-3 text-2xl font-medium">Excel + correo + mensajería</h2>
              <ul className="mt-6 space-y-3 text-sm text-[#A9ADB3]">
                {[
                  "Vencimientos dependen de seguimiento manual",
                  "Documentos quedan dispersos entre canales",
                  "Auditar requiere reconstruir la historia",
                  "El estado real depende de quién tenga la última copia",
                ].map((item) => <li key={item} className="flex gap-3"><span className="text-[#994550]">—</span>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Con ChileFlota</p>
              <h2 className="mt-3 text-2xl font-medium">Una fuente operacional</h2>
              <ul className="mt-6 space-y-3 text-sm text-[#A9ADB3]">
                {[
                  "Alertas vinculadas a vigencias y responsables",
                  "Documentos y estados en una sola operación",
                  "Historial disponible para auditoría",
                  "Búsqueda y lectura común por empresa, conductor y requisito",
                ].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#39765B]" />{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-[#303238] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">Planes</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">Escala según la operación.</h2>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              { name: "Starter", features: ["Hasta 10 vehículos", "Hasta 5 conductores", "Alertas básicas", "1 usuario"] },
              { name: "Professional", features: ["Hasta 50 vehículos", "Hasta 20 conductores", "Alertas avanzadas", "5 usuarios", "Reportes"], highlighted: true },
              { name: "Enterprise", features: ["Flotas ilimitadas", "Usuarios ilimitados", "Integración API", "Soporte dedicado", "Configuración avanzada"] },
            ].map((plan) => (
              <div key={plan.name} className={`${surface} p-6 ${plan.highlighted ? "outline outline-1 outline-[#742D3D]" : ""}`}>
                <h3 className="text-xl font-medium">{plan.name}</h3>
                <ul className="my-7 space-y-3 text-sm text-[#A9ADB3]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6FA48A]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full rounded-[5px] ${plan.highlighted ? "bg-[#742D3D] hover:bg-[#87364A]" : "bg-[#202226] hover:bg-[#25282D]"}`}>
                  Consultar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A9ADB3]">ChileFlota</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">El próximo documento crítico debe aparecer antes de convertirse en un problema.</h2>
            <p className="mt-4 text-sm leading-6 text-[#A9ADB3]">Accede al sistema o solicita una presentación del flujo operacional.</p>
          </div>
          <Link href="/login">
            <Button size="lg" className="rounded-[5px] bg-[#742D3D] hover:bg-[#87364A]">
              Acceder <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#303238] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-[#777C84] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-[#C6C8CC]">
            <Shield className="h-4 w-4 text-[#9A5968]" />
            ChileFlota
          </div>
          <p>Compliance documental y control operacional para flotas en Chile.</p>
        </div>
      </footer>
    </div>
  )
}
