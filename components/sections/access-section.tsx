import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle2,
  Barcode,
  Settings,
  Eye,
  Zap,
  ArrowRight,
} from "lucide-react"

export function AccessSection() {
  const dashboards = [
    {
      title: "Portal de Ejecutivas",
      description: "Revisar y validar documentos de conductores",
      href: "/dashboard/executive",
      icon: Eye,
      color: "bg-primary",
    },
    {
      title: "Dashboard Principal",
      description: "Panel de control general",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "bg-accent",
    },
    {
      title: "Gestión de Transportistas",
      description: "Administrar datos de transportistas",
      href: "/dashboard/transporters",
      icon: Users,
      color: "bg-secondary",
    },
    {
      title: "Subida de Documentos",
      description: "OCR y análisis automático",
      href: "/dashboard/upload",
      icon: FileText,
      color: "bg-primary",
    },
    {
      title: "Verificación de Documentos",
      description: "Validación y aprobación",
      href: "/dashboard/verification",
      icon: CheckCircle2,
      color: "bg-accent",
    },
    {
      title: "Certificados F-30",
      description: "Gestión de F-30 automáticos",
      href: "/dashboard/f30",
      icon: Barcode,
      color: "bg-secondary",
    },
  ]

  return (
    <section className="py-20 bg-card/50 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Acceso a Funcionalidades</h2>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitas para gestionar Transportes Labbe en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant="outline"
                asChild
                className="h-auto p-6 flex flex-col items-start justify-start text-left group hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <a href={item.href}>
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Acceder
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </Button>
            )
          })}
        </div>

        <div className="mt-16 bg-background/50 rounded-xl p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-bold mb-2">Automatización 100%</h4>
              <p className="text-sm text-muted-foreground">
                OCR inteligente y validación automática de documentos
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-bold mb-2">Cumplimiento Total</h4>
              <p className="text-sm text-muted-foreground">
                Sigue todas las normativas DS N°158 y DS N°75
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-bold mb-2">Para Todos los Roles</h4>
              <p className="text-sm text-muted-foreground">
                Ejecutivas, conductores, despachadores y admins
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
