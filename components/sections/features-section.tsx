import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Wrench, Package, Shield, FileCheck, ShoppingCart, DollarSign, BarChart3, Users, Brain } from "lucide-react"

export function FeaturesSection() {
  const operacionCritica = [
    {
      icon: Zap,
      title: "Producción",
      description:
        "Control en tiempo real de equipos, líneas de producción y optimización de procesos mineros con trazabilidad completa.",
    },
    {
      icon: Wrench,
      title: "Mantención",
      description:
        "Gestión predictiva de mantenimientos, historial de equipos, planificación de paradas y control de costos de mantenimiento.",
    },
    {
      icon: Package,
      title: "Bodega",
      description:
        "Inventario integrado de repuestos y materiales, alertas de stock bajo mínimo y automatización de compras.",
    },
    {
      icon: Shield,
      title: "HSE / Seguridad",
      description:
        "Gestión de incidentes, auditorías de seguridad, capacitaciones y análisis de riesgos operacionales.",
    },
    {
      icon: FileCheck,
      title: "Documentos",
      description:
        "Control centralizado de permisos, certificaciones, licencias y documentación operacional con alertas de vencimiento.",
    },
  ]

  const gestionEmpresarial = [
    {
      icon: ShoppingCart,
      title: "Compras",
      description:
        "Gestión de órdenes de compra, proveedores, cotizaciones y seguimiento de entregas integrado con bodega.",
    },
    {
      icon: DollarSign,
      title: "Finanzas",
      description:
        "Control de costos operacionales, presupuestos, facturación y análisis financiero con proyecciones.",
    },
    {
      icon: BarChart3,
      title: "Reportes",
      description:
        "Dashboards ejecutivos con KPIs mineros reales, análisis predictivos e inteligencia operacional en tiempo real.",
    },
    {
      icon: Users,
      title: "Usuarios y Permisos",
      description:
        "Gestión de accesos, roles y permisos con trazabilidad de acciones y control granular por módulo.",
    },
    {
      icon: Brain,
      title: "Asistente IA",
      description:
        "IA operacional minera que responde preguntas sobre equipos, documentos, mantenimientos y proporciona análisis predictivos.",
    },
  ]

  return (
    <section id="caracteristicas" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            Ecosistema Modular <span className="text-primary">Integrado</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Una sola fuente de verdad que conecta toda tu operación minera: desde la producción en terreno hasta las decisiones ejecutivas, con trazabilidad completa e inteligencia operacional.
          </p>
        </div>

        {/* Operación Crítica */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Operación Crítica</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">Módulos que mantienen tu operación minera funcionando eficientemente en terreno</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {operacionCritica.map((module, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <module.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Gestión Empresarial */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Gestión Empresarial</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">Módulos que integran finanzas, compras, reportes e inteligencia para la toma de decisiones</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {gestionEmpresarial.map((module, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <module.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">De la operación en terreno a decisiones ejecutivas</h3>
            <p className="text-muted-foreground mb-6">
              Con trazabilidad completa, IA operacional y control en tiempo real en cada etapa del proceso.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium">Conocer más sobre nuestra plataforma →</button>
          </div>
        </div>
      </div>
    </section>
  )
}

