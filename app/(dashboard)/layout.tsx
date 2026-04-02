'use client'

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-dark">
      <DashboardSidebar userRole={user?.role || 'driver'} userName={user?.full_name || 'Usuario Demo'} />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
