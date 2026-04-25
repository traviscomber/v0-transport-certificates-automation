import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Smartphone, Globe, Lock, Zap, BarChart3, Truck, Calendar, AlertCircle } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: FileCheck,
      title: "Certificados F-30 Automáticos",
      description:
        "Generación automática de certificados F-30 con validación en tiempo real y envío directo a autoridades competentes.",
      badge: "Más Popular",
    },
    {
      icon: Smartphone,
      title: "App Móvil para Conductores",
      description:
        "Aplicación móvil que permite a conductores gestionar documentos, reportar incidencias y recibir actualizaciones en tiempo real.",
      badge: "Nuevo",
    },
    {
      icon: Globe,
      title: "Integración con Sistemas Gubernamentales",
      description:
        "Conexión directa con RUTA, SII y otros sistemas gubernamentales para automatizar trámites y validaciones.",
      badge: "Exclusivo",
    },
    {
      icon: Lock,
      title: "Seguridad Bancaria",
      description:
        "Encriptación de nivel bancario y cumplimiento con normativas de protección de datos chilenas e internacionales.",
      badge: null,
    },
    {
      icon: Zap,
      title: "Procesamiento en Tiempo Real",
      description:
        "Procesamiento instantáneo de documentos con IA que aprende de patrones y optimiza automáticamente los procesos.",
      badge: null,
    },
    {
      icon: BarChart3,
      title: "Analytics Predictivos",
      description:
        "Dashboards inteligentes que predicen mantenimientos, optimizan rutas y identifican oportunidades de ahorro.",
      badge: null,
    },
    {
      icon: Truck,
      title: "Gestión de Flota Integral",
      description:
        "Control completo de flota con seguimiento GPS, mantenimiento predictivo y optimización de combustible.",
      badge: null,
    },
    {
      icon: Calendar,
      title: "Planificación Inteligente",
      description:
        "Algoritmos de optimización que planifican rutas, cargas y horarios maximizando eficiencia y rentabilidad.",
      badge: null,
    },
    {
      icon: AlertCircle,
      title: "Alertas Proactivas",
      description:
        "Sistema de alertas que anticipa vencimientos, problemas potenciales y oportunidades de optimización.",
      badge: null,
    },
  ]

  return (
    <section id="caracteristicas" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            Características que <span className="text-primary">Transforman</span> tu Operación
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Cada característica está diseñada específicamente para resolver los desafíos únicos del transporte chileno,
            desde la complejidad normativa hasta la optimización operacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative"
            >
              {feature.badge && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">{feature.badge}</Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">¿Necesitas una característica específica?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo de desarrollo puede crear funcionalidades personalizadas para tu operación específica.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium">Contactar Equipo de Desarrollo →</button>
          </div>
        </div>
      </div>
    </section>
  )
}
