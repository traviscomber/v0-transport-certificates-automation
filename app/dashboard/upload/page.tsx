import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocumentUpload } from "@/components/upload/document-upload"

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subir Documentos</h1>
          <p className="text-muted-foreground mt-2">Carga certificados F-30, F-30-1 y documentos de máquinas</p>
        </div>
        <DocumentUpload />
      </div>
    </DashboardLayout>
  )
}
