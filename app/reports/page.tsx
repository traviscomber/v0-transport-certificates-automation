import { AutomatedReports } from "@/components/reports/automated-reports"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reportes Automatizados</h1>
        <p className="text-muted-foreground">Sistema inteligente de generación y programación de reportes</p>
      </div>

      <AutomatedReports />
    </div>
  )
}
