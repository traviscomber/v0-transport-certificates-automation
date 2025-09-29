import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SampleDocuments } from "@/components/samples/sample-documents"

export default function SamplesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentos de Muestra</h1>
          <p className="text-muted-foreground mt-2">Prueba el sistema OCR con estos documentos de ejemplo</p>
        </div>
        <SampleDocuments />
      </div>
    </DashboardLayout>
  )
}
