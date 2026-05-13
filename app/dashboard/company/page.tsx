import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { SmartAlerts } from '@/components/dashboard/smart-alerts'
import { DocumentAlertsWidget } from '@/components/document-alerts-widget'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <DashboardOverview />

      {/* Document Alerts - Primary focus on expiration dates */}
      <DocumentAlertsWidget />

      {/* Smart AI Alerts - Only shows high-confidence expiration predictions */}
      <SmartAlerts />
    </div>
  )
}

