"use client"

import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSearch,
  HardHat,
  Shield,
  Truck,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

const capabilities = [
  {
    icon: Database,
    title: "Evidencia PRT a escala nacional",
    description:
      "Ingesta trazable y reanudable de revisión técnica PRT para enriquecer vehículos y respaldar decisiones de compliance con evidencia fuente.",
  },
  {
    icon: FileSearch,
    title: "Gestión documental trazable",
    description:
      "Documentos de transportistas, subcontratistas y conductores con estados, historial, búsqueda por RUT y revisión operacional.",
  },
  {
    icon: Shield,
    title: "Compliance basado en evidencia",
    description:
      "La plataforma separa evidencia canónica de estados derivados: una ausencia de datos nunca se convierte automáticamente en un hecho negativo.",
  },
  {
    icon: Zap,
    title: "Automatización supervisada",
    description:
      "Workers, OCR, verificaciones externas, reconciliación y alertas operan con observabilidad, recuperación y control de calidad.",
  },
]

const useCases = [
  {
    icon: Truck,
    title: "Transporte y logística",
    description: "Control documental de flotas, conductores, proveedores y evidencia vehicular en una sola operación.",
  },
  {
    icon: HardHat,
    title: "Contratistas y minería",
    description: "Carpetas de cumplimiento, subcontratistas, personal y vehículos con trazabilidad para mandantes.",
    href: "/mining/landing",
  },
  {
    icon: Building2,
    title: "Mandantes y grandes empresas",
    description: "Visibilidad consolidada de documentación pendiente, revisiones, excepciones y evidencia operacional.",
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold" aria-label="ChileFlota inicio">
            <Shield className="h-6 w-6 text-orange-500" />
            ChileFlota
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#plataforma" className="text-slate-300 transition hover:text-white">Plataforma</a>
            <a href="#casos" className="text-slate-300 transition hover:text-white">Casos de uso</a>
            <a href="#n3uralia" className="text-slate-300 transition hover:text-white">N3uralia</a>
            <Link href="/contact" className="text-slate-300 transition hover:text-white">Contacto</Link>
            <Link href="/auth/login"><Button variant="outline" size="sm">Ingresar</Button></Link>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2">
            <Shield className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Compliance e inteligencia para flotas en Chile</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Evidencia documental y vehicular para operar flotas con mayor control
          </h1>

          <p className="mx-auto max-w-3xl text-xl text-slate-300">
            ChileFlota conecta vehículos, transportistas, subcontratistas, conductores, revisión técnica PRT,
            documentos y verificaciones externas en un sistema trazable de compliance e inteligencia operacional para Chile.
          </p>

          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Producto desarrollado por <a href="https://n3uralia.com" className="font-medium text-orange-300 hover:text-orange-200" rel="noopener noreferrer">N3uralia</a>,
            factoría de software e infraestructura de inteligencia artificial. LABBE es la implementación operacional actualmente desplegada sobre esta plataforma.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2 bg-orange-500 text-white hover:bg-orange-600">
                Acceder a la plataforma <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact"><Button size="lg" variant="outline">Solicitar presentación</Button></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <article>
            <div className="mb-3 flex items-center gap-2 text-orange-400"><Truck className="h-5 w-5" /><h2 className="font-semibold">Vehículos y PRT</h2></div>
            <p className="text-sm leading-6 text-slate-300">Evidencia histórica de revisión técnica vinculable por patente, diseñada para alimentar estados vehiculares y compliance sin crear datos ficticios.</p>
          </article>
          <article>
            <div className="mb-3 flex items-center gap-2 text-orange-400"><Users className="h-5 w-5" /><h2 className="font-semibold">Personas y empresas</h2></div>
            <p className="text-sm leading-6 text-slate-300">Transportistas, subcontratistas y conductores operan sobre identidades canónicas por RUT y flujos documentales auditables.</p>
          </article>
          <article>
            <div className="mb-3 flex items-center gap-2 text-orange-400"><ClipboardCheck className="h-5 w-5" /><h2 className="font-semibold">Revisión y trazabilidad</h2></div>
            <p className="text-sm leading-6 text-slate-300">Pendientes, aprobaciones, rechazos, excepciones y verificaciones se mantienen conectados a la evidencia que originó cada estado.</p>
          </article>
        </div>
      </section>

      <section id="plataforma" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Plataforma de gestión de flotas y compliance basada en evidencia</h2>
            <p className="text-lg text-slate-300">ChileFlota conserva la fuente, normaliza la información y automatiza tareas repetibles sin ocultar incertidumbre.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-xl border border-slate-700 bg-slate-800/40 p-6">
                <Icon className="mb-4 h-7 w-7 text-orange-400" />
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Diseñada para problemas reales de transporte y flotas en Chile</h2>
            <p className="text-slate-300">Menos búsqueda manual, más evidencia disponible para decidir y revisar.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <AlertCircle className="mb-4 h-7 w-7 text-red-400" />
              <h3 className="mb-2 font-semibold">Información dispersa</h3>
              <p className="text-sm leading-6 text-slate-300">Correos, planillas y archivos separados dificultan saber qué evidencia existe realmente para una operación.</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <AlertCircle className="mb-4 h-7 w-7 text-red-400" />
              <h3 className="mb-2 font-semibold">Documentación pendiente</h3>
              <p className="text-sm leading-6 text-slate-300">Los equipos necesitan encontrar pendientes por RUT, entidad y estado sin perder registros por límites o filtros tardíos.</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <AlertCircle className="mb-4 h-7 w-7 text-red-400" />
              <h3 className="mb-2 font-semibold">Decisiones sin contexto</h3>
              <p className="text-sm leading-6 text-slate-300">ChileFlota conecta documentación interna con fuentes externas y evidencia vehicular antes de derivar estados de compliance.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="casos" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Casos de uso</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map(({ icon: Icon, title, description, href }) => {
              const content = (<><Icon className="mb-4 h-8 w-8 text-orange-400" /><h3 className="mb-2 font-semibold">{title}</h3><p className="text-sm leading-6 text-slate-300">{description}</p></>)
              return href ? (
                <Link key={title} href={href} className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 transition hover:border-orange-500/50">{content}</Link>
              ) : (
                <article key={title} className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">{content}</article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="n3uralia" className="border-y border-slate-800 bg-slate-900/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Software factory</p>
          <h2 className="mb-5 text-3xl font-bold md:text-4xl">ChileFlota is built by N3uralia</h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-300">N3uralia desarrolla infraestructura de IA, sistemas autónomos y plataformas de software orientadas a datos verificables, automatización y operación real.</p>
          <a href="https://n3uralia.com" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-medium text-orange-300 hover:text-orange-200">Conocer N3uralia <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-orange-500/20 bg-orange-500/10 p-10 text-center">
          <CheckCircle2 className="mx-auto mb-5 h-9 w-9 text-orange-400" />
          <h2 className="mb-4 text-3xl font-bold">Construye una operación de flota más trazable</h2>
          <p className="mb-8 text-lg text-slate-300">Conoce cómo ChileFlota puede centralizar evidencia, PRT y flujos de compliance para tu operación en Chile.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact"><Button size="lg" className="bg-orange-500 hover:bg-orange-600">Solicitar presentación</Button></Link>
            <Link href="/auth/login"><Button size="lg" variant="outline">Ingresar</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 font-semibold text-white"><Shield className="h-4 w-4 text-orange-500" /> ChileFlota</div>
            <p>Compliance e inteligencia para flotas en Chile.</p>
          </div>
          <p>Developed by <a href="https://n3uralia.com" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-200">N3uralia</a>.</p>
        </div>
      </footer>
    </main>
  )
}
