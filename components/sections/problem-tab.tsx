import { Card, CardContent } from "@/components/ui/card"

const AlertTriangleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="m12 17 .01 0" />
  </svg>
)

const FileXIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m9.5 12.5 5-5" />
    <path d="m14.5 12.5-5-5" />
  </svg>
)

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const DollarSignIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

export function ProblemTab() {
  return (
    <div className="space-y-12">
      {/* Problem Overview */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
          El Transporte Chileno: <span className="text-destructive">Un Laberinto Regulatorio</span>
        </h2>
        <p className="text-xl text-muted-foreground text-balance leading-relaxed">
          Las empresas de transporte enfrentan una complejidad normativa sin precedentes. Certificados F-30,
          documentación manual, multas millonarias y procesos que consumen recursos valiosos cada día.
        </p>
      </div>

      {/* Key Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <FileXIcon />
            <h3 className="text-2xl font-bold mb-4">Certificados F-30 Manuales</h3>
            <p className="text-muted-foreground mb-4">
              Cada vehículo requiere certificación ambiental manual. Proceso lento, propenso a errores y que consume
              horas de trabajo administrativo.
            </p>
            <div className="text-sm text-destructive font-medium">⚠️ Multas desde $500.000 por certificado vencido</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <AlertTriangleIcon />
            <h3 className="text-2xl font-bold mb-4">Normativas Cambiantes</h3>
            <p className="text-muted-foreground mb-4">
              Regulaciones ambientales y de transporte cambian constantemente. Mantenerse actualizado es un desafío
              costoso y complejo.
            </p>
            <div className="text-sm text-destructive font-medium">⚠️ Nuevas regulaciones cada 3-6 meses</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <ClockIcon />
            <h3 className="text-2xl font-bold mb-4">Tiempo Perdido</h3>
            <p className="text-muted-foreground mb-4">
              Administradores dedican 60% de su tiempo a documentación. Tiempo que debería invertirse en operaciones y
              crecimiento.
            </p>
            <div className="text-sm text-destructive font-medium">⚠️ 24 horas semanales en papeleo por empresa</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <DollarSignIcon />
            <h3 className="text-2xl font-bold mb-4">Costos Ocultos</h3>
            <p className="text-muted-foreground mb-4">
              Multas, retrasos operacionales, personal dedicado a documentación y oportunidades perdidas suman millones
              anuales.
            </p>
            <div className="text-sm text-destructive font-medium">⚠️ Promedio $15M anuales en costos evitables</div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Statistics */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8">
        <h3 className="text-3xl font-bold text-center mb-8">El Costo Real del Problema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-destructive mb-2">85%</div>
            <div className="text-sm text-muted-foreground">Empresas con multas anuales</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-destructive mb-2">$8M</div>
            <div className="text-sm text-muted-foreground">Promedio multas por empresa</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-destructive mb-2">240</div>
            <div className="text-sm text-muted-foreground">Horas mensuales en documentos</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-destructive mb-2">45%</div>
            <div className="text-sm text-muted-foreground">Tiempo perdido vs. operaciones</div>
          </div>
        </div>
      </div>
    </div>
  )
}
