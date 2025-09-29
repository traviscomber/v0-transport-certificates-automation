import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const CalendarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
)

const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const PhoneSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

export function DemoTab() {
  return (
    <div className="space-y-12">
      {/* Demo Overview */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
          Prueba el <span className="text-primary">Sistema en Vivo</span>
        </h2>
        <p className="text-xl text-muted-foreground text-balance leading-relaxed">
          Accede inmediatamente al sistema con cuentas de demostración o agenda una presentación personalizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="bg-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-8 text-center">
            <PlayIcon />
            <h3 className="text-2xl font-bold mb-4">Demo Interactivo</h3>
            <p className="text-muted-foreground mb-6">
              Prueba el sistema inmediatamente con cuentas de demostración. Explora todas las funcionalidades sin
              compromiso.
            </p>
            <Link href="/auth/login">
              <Button size="lg" className="w-full">
                Probar Ahora <ArrowRightIcon />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-8 text-center">
            <CalendarIcon />
            <h3 className="text-2xl font-bold mb-4">Demo Personalizada</h3>
            <p className="text-muted-foreground mb-6">
              30 minutos con nuestro equipo especializado. Verás tu operación automatizada con datos reales de tu
              empresa.
            </p>
            <Button size="lg" className="w-full bg-transparent" variant="outline">
              Agendar Demo <ArrowRightIcon />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-8 text-center">
            <PhoneIcon />
            <h3 className="text-2xl font-bold mb-4">Consulta Inmediata</h3>
            <p className="text-muted-foreground mb-6">
              Habla directamente con un especialista. Respuestas inmediatas sobre tu caso específico.
            </p>
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Llamar Ahora <PhoneSmallIcon />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">Cuentas de Demostración Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold mb-1">Conductor</h4>
            <p className="text-sm text-muted-foreground">Sube y gestiona certificados</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold mb-1">Despachador</h4>
            <p className="text-sm text-muted-foreground">Valida y gestiona conductores</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
            <h4 className="font-semibold mb-1">Administrador</h4>
            <p className="text-sm text-muted-foreground">Acceso completo al sistema</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Cada cuenta incluye datos de ejemplo realistas para una experiencia completa
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-muted/50 rounded-2xl p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">Contacto Directo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <PhoneSmallIcon />
            <span className="text-lg">+56 9 8765 4321</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <MailIcon />
            <span className="text-lg">contacto@cleaner.cl</span>
          </div>
        </div>
      </div>

      {/* Implementation Process */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-8">Proceso de Implementación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="text-xl font-bold mb-2">Análisis</h4>
            <p className="text-muted-foreground">Evaluamos tu operación actual y diseñamos la solución perfecta.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="text-xl font-bold mb-2">Configuración</h4>
            <p className="text-muted-foreground">Configuramos la plataforma con tus datos y procesos específicos.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="text-xl font-bold mb-2">Go Live</h4>
            <p className="text-muted-foreground">Lanzamiento en 30 días con capacitación completa de tu equipo.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
