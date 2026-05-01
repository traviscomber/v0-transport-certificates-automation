import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { ComplianceDashboard } from '@/components/dashboard/compliance-dashboard'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardOverview />
      <ComplianceDashboard />
    </div>
  )
}

