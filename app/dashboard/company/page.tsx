import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Dashboard with KPIs and Alerts - Single source of truth */}
      <DashboardOverview />
    </div>
  )
}

