import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { ComplianceDashboard } from '@/components/dashboard/compliance-dashboard'
import { SmartAlerts } from '@/components/dashboard/smart-alerts'
import { DocumentAlertsWidget } from '@/components/document-alerts-widget'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplianceDashboard />
        </div>
        <div>
          <DocumentAlertsWidget />
        </div>
      </div>
      <SmartAlerts />
    </div>
  )
}

