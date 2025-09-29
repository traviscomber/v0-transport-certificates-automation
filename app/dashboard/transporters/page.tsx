import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TransporterManagement } from "@/components/transporters/transporter-management"

export default function TransportersPage() {
  return (
    <DashboardLayout>
      <TransporterManagement />
    </DashboardLayout>
  )
}
