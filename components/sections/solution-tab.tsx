import { Card, CardContent } from "@/components/ui/card"
import {
  FileCheck,
  Shield,
  Zap,
  Smartphone,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Truck,
  Database,
  Bell,
} from "lucide-react"

export function SolutionTab() {
  return (
    <div className="space-y-16">
      {/* Solution Overview */}
      <div className="text-center max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-balance mb-8">
          La Solución: <span className="text-primary">Automatización Total</span>
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed mb-8">
          Transformamos la complejidad regulatoria en simplicidad operacional. Una plataforma integral que automatiza
          todo el ecosistema de cumplimiento normativo del transporte chileno.
        </p>
        <div className="flex items-center justify-center gap-4 text-lg font-medium">
          <span className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            F-30 Automático
          </span>
          <span className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            Cumplimiento 100%
          </span>
          <span className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            Implementación 30 días
          </span>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl p-8 md:p-12">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">¿Cómo Funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-4">1. Integración Automática</h4>
            <p className="text-muted-foreground">
              Conectamos con sistemas gubernamentales y bases de datos oficiales. Sincronización automática de
              regulaciones y actualizaciones normativas.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-4">2. Procesamiento Inteligente</h4>
            <p className="text-muted-foreground">
              IA especializada en normativa chilena procesa documentos, genera certificados y valida cumplimiento en
              tiempo real.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-4">3. Monitoreo Continuo</h4>
            <p className="text-muted-foreground">
              Alertas proactivas, renovaciones automáticas y reportes de cumplimiento. Nunca más multas por documentos
              vencidos.
            </p>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Características Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <FileCheck className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Certificados F-30 Automáticos</h4>
              <p className="text-muted-foreground mb-4">
                Generación, renovación y gestión automática de certificados F-30. Integración directa con el Ministerio
                de Transportes.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Renovación automática 30 días antes del vencimiento
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Validación en tiempo real con bases oficiales
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Historial completo y trazabilidad
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <Shield className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Cumplimiento Normativo Total</h4>
              <p className="text-muted-foreground mb-4">
                Monitoreo continuo de todas las regulaciones chilenas. Actualizaciones automáticas cuando cambian las
                normativas.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Seguimiento de DS N°158, DS N°75 y más
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Alertas de cambios normativos
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Reportes de cumplimiento automáticos
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <Truck className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Gestión de Flota Inteligente</h4>
              <p className="text-muted-foreground mb-4">
                Control total de vehículos, conductores y rutas. Optimización automática y mantenimiento predictivo.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Tracking GPS en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Mantenimiento predictivo con IA
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Optimización de rutas y combustible
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <Smartphone className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Aplicación Móvil Completa</h4>
              <p className="text-muted-foreground mb-4">
                Conductores y administradores acceden desde cualquier lugar. Funcionalidad completa offline.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  iOS y Android nativo
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Modo offline para zonas sin señal
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Notificaciones push inteligentes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <BarChart3 className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Analytics y Reportería</h4>
              <p className="text-muted-foreground mb-4">
                Dashboards en tiempo real, KPIs automáticos y reportes personalizables para toma de decisiones.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Dashboards ejecutivos personalizables
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Reportes automáticos programables
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Predicciones con machine learning
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <Users className="w-12 h-12 mb-4" />
              <h4 className="text-xl font-bold mb-4">Soporte Especializado</h4>
              <p className="text-muted-foreground mb-4">
                Equipo experto en transporte chileno. Implementación rápida y soporte continuo 24/7.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Implementación en 30 días garantizada
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Soporte 24/7 en español
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Capacitación completa del equipo
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results & ROI */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl p-8 md:p-12">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4">Resultados Comprobados</h3>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Empresas de transporte chilenas que han implementado nuestra solución reportan mejoras significativas en
          eficiencia operacional y cumplimiento normativo.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Reducción en tiempo de gestión documental</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Cumplimiento normativo garantizado</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-primary">30</div>
            <div className="text-sm text-muted-foreground">Días promedio de implementación</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Multas por documentos vencidos</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background/50 rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-4" />
            <h4 className="font-bold mb-2">Ahorro de Tiempo</h4>
            <p className="text-sm text-muted-foreground">40+ horas semanales liberadas para actividades estratégicas</p>
          </div>
          <div className="bg-background/50 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4" />
            <h4 className="font-bold mb-2">Cero Riesgo</h4>
            <p className="text-sm text-muted-foreground">Eliminación total de multas por incumplimiento documental</p>
          </div>
          <div className="bg-background/50 rounded-xl p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-4" />
            <h4 className="font-bold mb-2">ROI Inmediato</h4>
            <p className="text-sm text-muted-foreground">Retorno de inversión en menos de 6 meses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
