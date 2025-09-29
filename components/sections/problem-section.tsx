import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, FileX, DollarSign } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Complejidad Normativa Extrema",
      description:
        "El transporte en Chile enfrenta más de 15 regulaciones diferentes, desde certificados F-30 hasta normativas ambientales, creando un laberinto burocrático imposible de navegar manualmente.",
    },
    {
      icon: Clock,
      title: "Pérdida de Tiempo Crítica",
      description:
        "Las empresas pierden hasta 40 horas semanales en gestión documental, tiempo que debería invertirse en operaciones productivas y crecimiento del negocio.",
    },
    {
      icon: FileX,
      title: "Errores Costosos y Multas",
      description:
        "Un solo error en certificados F-30 puede resultar en multas de hasta $2.000.000 CLP, sin contar las detenciones operacionales y pérdida de contratos.",
    },
    {
      icon: DollarSign,
      title: "Ineficiencia Operacional",
      description:
        "La gestión manual genera sobrecostos del 25% en operaciones, reduciendo márgenes y competitividad en un mercado cada vez más exigente.",
    },
  ]

  return (
    <section id="problema" className="py-24 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            El Problema que Paraliza al <span className="text-primary">Transporte Chileno</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            El sector transporte en Chile enfrenta una crisis de eficiencia debido a la complejidad normativa y la
            gestión manual de documentos. Esta realidad está limitando el crecimiento y competitividad de miles de
            empresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg">
                    <problem.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-destructive">El Costo Real de la Ineficiencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-destructive mb-2">$50M+</div>
              <div className="text-sm text-muted-foreground">CLP perdidos anualmente por empresa promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive mb-2">2,000+</div>
              <div className="text-sm text-muted-foreground">Horas perdidas por año en gestión manual</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive mb-2">85%</div>
              <div className="text-sm text-muted-foreground">De empresas reportan errores frecuentes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
