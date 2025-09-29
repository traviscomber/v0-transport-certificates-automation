import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CertificateManagement } from "@/components/certificates/certificate-management"

export default function F30Page() {
  return (
    <DashboardLayout>
      <CertificateManagement
        title="Certificados F-30"
        description="Gestión de certificados F-30 para transporte de carga"
        certificateType="f30"
      />
    </DashboardLayout>
  )
}
