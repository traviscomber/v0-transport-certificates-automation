import { Card, CardContent } from "@/components/ui/card"

const FileCheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m9 15 2 2 4-4" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
)

const ZapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
)

const SmartphoneIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
)

const BarChart3Icon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M7 16V9" />
    <path d="M12 16V5" />
    <path d="M17 16v-2" />
  </svg>
)

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const TruckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)

const DatabaseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
)

const BellIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

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
            <CheckCircleIcon />
            F-30 Automático
          </span>
          <span className="flex items-center gap-2 text-primary">
            <CheckCircleIcon />
            Cumplimiento 100%
          </span>
          <span className="flex items-center gap-2 text-primary">
            <CheckCircleIcon />
            Implementación rápida
          </span>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl p-8 md:p-12">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">¿Cómo Funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <DatabaseIcon />
            </div>
            <h4 className="text-xl font-bold mb-4">1. Integración Automática</h4>
            <p className="text-muted-foreground">
              Conectamos con sistemas gubernamentales y bases de datos oficiales. Sincronización automática de
              regulaciones y actualizaciones normativas.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ZapIcon />
            </div>
            <h4 className="text-xl font-bold mb-4">2. Procesamiento Inteligente</h4>
            <p className="text-muted-foreground">
              IA especializada en normativa chilena procesa documentos, genera certificados y valida cumplimiento en
              tiempo real.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BellIcon />
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
              <FileCheckIcon />
              <h4 className="text-xl font-bold mb-4">Certificados F-30 Automáticos</h4>
              <p className="text-muted-foreground mb-4">
                Generación, renovación y gestión automática de certificados F-30. Integración directa con el Ministerio
                de Transportes.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Renovación automática con anticipación previa al vencimiento
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Validación en tiempo real con bases oficiales
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Historial completo y trazabilidad
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <ShieldIcon />
              <h4 className="text-xl font-bold mb-4">Cumplimiento Normativo Total</h4>
              <p className="text-muted-foreground mb-4">
                Monitoreo continuo de todas las regulaciones chilenas. Actualizaciones automáticas cuando cambian las
                normativas.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Seguimiento de DS N°158, DS N°75 y más
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Alertas de cambios normativos
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Reportes de cumplimiento automáticos
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <TruckIcon />
              <h4 className="text-xl font-bold mb-4">Gestión de Flota Inteligente</h4>
              <p className="text-muted-foreground mb-4">
                Control total de vehículos, conductores y rutas. Optimización automática y mantenimiento predictivo.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Tracking GPS en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Mantenimiento predictivo con IA
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Optimización de rutas y combustible
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <SmartphoneIcon />
              <h4 className="text-xl font-bold mb-4">Aplicación Móvil Completa</h4>
              <p className="text-muted-foreground mb-4">
                Conductores y administradores acceden desde cualquier lugar. Funcionalidad completa offline.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  iOS y Android nativo
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Modo offline para zonas sin señal
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Notificaciones push inteligentes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <BarChart3Icon />
              <h4 className="text-xl font-bold mb-4">Analytics y Reportería</h4>
              <p className="text-muted-foreground mb-4">
                Dashboards en tiempo real, KPIs automáticos y reportes personalizables para toma de decisiones.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Dashboards ejecutivos personalizables
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Reportes automáticos programables
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Predicciones con machine learning
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <UsersIcon />
              <h4 className="text-xl font-bold mb-4">Soporte Especializado</h4>
              <p className="text-muted-foreground mb-4">
                Equipo experto en transporte chileno. Implementación rápida y soporte continuo 24/7.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Implementación rápida garantizada
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
                  Soporte 24/7 en español
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon />
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
            <ClockIcon />
            <h4 className="font-bold mb-2">Ahorro de Tiempo</h4>
            <p className="text-sm text-muted-foreground">40+ horas semanales liberadas para actividades estratégicas</p>
          </div>
          <div className="bg-background/50 rounded-xl p-6 text-center">
            <ShieldIcon />
            <h4 className="font-bold mb-2">Cero Riesgo</h4>
            <p className="text-sm text-muted-foreground">Eliminación total de multas por incumplimiento documental</p>
          </div>
          <div className="bg-background/50 rounded-xl p-6 text-center">
            <BarChart3Icon />
            <h4 className="font-bold mb-2">ROI Inmediato</h4>
            <p className="text-sm text-muted-foreground">Retorno de inversión en menos de 6 meses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
