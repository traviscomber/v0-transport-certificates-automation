export function StatsSection() {
  const stats = [
    {
      value: "95%",
      label: "Reducción en tiempo de gestión documental",
      description: "De 40 horas semanales a menos de 2 horas",
    },
    {
      value: "$2.5M+",
      label: "CLP ahorrados por empresa anualmente",
      description: "Entre reducción de multas y eficiencia operacional",
    },
    {
      value: "100%",
      label: "Cumplimiento normativo garantizado",
      description: "Cero multas por documentación incorrecta",
    },
    {
      value: "500+",
      label: "Empresas ya transformadas",
      description: "Desde PyMEs hasta grandes flotas nacionales",
    },
  ]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            Resultados que <span className="text-primary">Hablan por Sí Solos</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Más de 500 empresas chilenas ya han transformado sus operaciones con TransporteCL. Estos son los resultados
            reales que están obteniendo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground mb-2">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Casos de Éxito Reales</h3>
            <p className="text-muted-foreground">Empresas chilenas que han revolucionado sus operaciones</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-background rounded-lg">
              <div className="text-lg font-bold mb-2">Transportes del Sur</div>
              <div className="text-sm text-muted-foreground mb-4">Flota de 150 vehículos</div>
              <div className="text-primary font-semibold">Ahorro de $180M CLP anuales</div>
            </div>
            <div className="text-center p-6 bg-background rounded-lg">
              <div className="text-lg font-bold mb-2">LogiChile Express</div>
              <div className="text-sm text-muted-foreground mb-4">Operación nacional</div>
              <div className="text-primary font-semibold">Cero multas en 18 meses</div>
            </div>
            <div className="text-center p-6 bg-background rounded-lg">
              <div className="text-lg font-bold mb-2">Minera Copper Trans</div>
              <div className="text-sm text-muted-foreground mb-4">Transporte especializado</div>
              <div className="text-primary font-semibold">98% reducción en errores</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
