import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { ComplianceDashboard } from '@/components/dashboard/compliance-dashboard'
import { SmartAlerts } from '@/components/dashboard/smart-alerts'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardOverview />
      <ComplianceDashboard />
      <SmartAlerts />
    </div>
  )
}

