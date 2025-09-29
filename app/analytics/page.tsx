import { ComplianceDashboard } from "@/components/analytics/compliance-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Análisis de Cumplimiento</h1>
        <p className="text-muted-foreground">
          Dashboard inteligente con métricas y predicciones de cumplimiento normativo
        </p>
      </div>

      <ComplianceDashboard />
    </div>
  )
}
