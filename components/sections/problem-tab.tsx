import { Card, CardContent } from "@/components/ui/card"
import {
  AlertTriangle,
  FileX,
  Clock,
  DollarSign,
} from "lucide-react"

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
            <FileX className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Certificados F-30 Manuales</h3>
            <p className="text-muted-foreground mb-4">
              Trámite burocrático lento y propenso a errores. Renovaciones olvidadas que resultan en multas.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 6 meses promedio en procesamiento</li>
              <li>• Documentación incompleta rechazada constantemente</li>
              <li>• Sin trazabilidad de solicitudes</li>
              <li>• Múltiples visitas a oficinas gubernamentales</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Normativas Cambiantes</h3>
            <p className="text-muted-foreground mb-4">
              Las regulaciones cambian constantemente sin aviso. Imposible mantenerse actualizado manualmente.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• DS N°158, DS N°75, resoluciones nuevas cada mes</li>
              <li>• Cambios sin comunicación previa</li>
              <li>• Multas por incumplimiento de nuevas normas</li>
              <li>• Necesidad de monitoreo constante de 5+ fuentes</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <Clock className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Tiempo Perdido</h3>
            <p className="text-muted-foreground mb-4">
              El equipo administrativo dedica 40+ horas semanales a gestión documental en vez de estrategia.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Gestión manual de cientos de documentos</li>
              <li>• Vencimientos olvidados = suspensiones de operaciones</li>
              <li>• Coordinación compleja entre departamentos</li>
              <li>• Auditorías constantes para verificar cumplimiento</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
          <CardContent className="p-8">
            <DollarSign className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Costos Ocultos</h3>
            <p className="text-muted-foreground mb-4">
              Multas, penalizaciones y oportunidades perdidas por incumplimiento normativo.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Multas: $2M - $10M+ por incumplimiento de F-30</li>
              <li>• Suspensión de operaciones (sin ingresos)</li>
              <li>• Costo de recursos para trámites: $500k - $1M anual</li>
              <li>• Riesgos legales y antecedentes penales</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* The Current Reality */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 md:p-12 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">La Realidad Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-5xl font-bold text-destructive mb-2">47%</div>
            <p className="text-muted-foreground">
              De empresas de transporte han recibido multas por incumplimiento documental en los últimos 3 años
            </p>
          </div>
          <div>
            <div className="text-5xl font-bold text-destructive mb-2">$50M+</div>
            <p className="text-muted-foreground">
              En multas acumuladas por empresas chilenas por problemas de F-30 (2023)
            </p>
          </div>
          <div>
            <div className="text-5xl font-bold text-destructive mb-2">85%</div>
            <p className="text-muted-foreground">
              De las suspensiones operacionales son prevenibles con automatización
            </p>
          </div>
        </div>
      </div>

      {/* Impact on Business */}
      <div className="space-y-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center">Impacto en tu Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background border border-border rounded-xl p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">💼</span> Operacional
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Parálisis operacional por certificados vencidos</li>
              <li>• Pérdida de clientes por suspensiones</li>
              <li>• Complejidad en gestión de flota</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-xl p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span> Financiero
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Multas que pueden alcanzar millones</li>
              <li>• Inmovilización de vehículos</li>
              <li>• Costos de cumplimiento manual insostenibles</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-xl p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">⚖️</span> Legal
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Riesgos penales para gerentes</li>
              <li>• Antecedentes que afectan licencias</li>
              <li>• Conflictos con autoridades</li>
            </ul>
          </div>
          <div className="bg-background border border-border rounded-xl p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">👥</span> Recurso Humano
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Equipo dedicado solo a papeleo</li>
              <li>• Alta rotación por trabajo tedioso</li>
              <li>• Falta de talento estratégico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
