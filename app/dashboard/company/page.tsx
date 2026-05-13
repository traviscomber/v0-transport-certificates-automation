import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { DocumentAlertsWidget } from '@/components/document-alerts-widget'
import dynamic from 'next/dynamic'

const SmartAlerts = dynamic(() => import('@/components/dashboard/smart-alerts').then(mod => ({ default: mod.SmartAlerts })), { ssr: false })

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

