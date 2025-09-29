import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CertificateManagement } from "@/components/certificates/certificate-management"

export default function MachinesPage() {
  return (
    <DashboardLayout>
      <CertificateManagement
        title="Documentos de Máquinas"
        description="Gestión de permisos, patentes y licencias de vehículos"
        certificateType="machines"
      />
    </DashboardLayout>
  )
}
