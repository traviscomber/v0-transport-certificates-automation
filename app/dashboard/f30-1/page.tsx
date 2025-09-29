import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CertificateManagement } from "@/components/certificates/certificate-management"

export default function F301Page() {
  return (
    <DashboardLayout>
      <CertificateManagement
        title="Certificados F-30-1"
        description="Gestión de certificados F-30-1 para transporte especializado"
        certificateType="f30-1"
      />
    </DashboardLayout>
  )
}
