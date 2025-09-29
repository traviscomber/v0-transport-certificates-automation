import { Card, CardContent } from "@/components/ui/card"
import { FileCheck, Shield, Zap } from "lucide-react"

export function SolutionSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            El Problema: <span className="text-destructive">Complejidad</span>
            <br />
            La Solución: <span className="text-primary">Automatización</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed max-w-2xl mx-auto">
            El transporte chileno enfrenta regulaciones complejas, documentación manual y multas costosas. Nosotros lo
            automatizamos todo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <FileCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">F-30 Automático</h3>
              <p className="text-muted-foreground">
                Genera certificados F-30 automáticamente. Sin errores, sin retrasos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Cumplimiento Total</h3>
              <p className="text-muted-foreground">
                100% cumplimiento normativo. Actualizaciones automáticas de regulaciones.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Gestión Unificada</h3>
              <p className="text-muted-foreground">
                Una plataforma para todo: documentos, rutas, mantenimiento, reportes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-8">Resultados Reales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Menos tiempo en documentos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Cumplimiento normativo</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30</div>
              <div className="text-sm text-muted-foreground">Días implementación</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">Multas por documentos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
