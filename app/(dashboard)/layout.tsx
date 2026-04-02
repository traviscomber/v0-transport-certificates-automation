'use client'

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Skip rendering sidebar during prerender/build - only show on client
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <main className="md:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Show loading state during hydration
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

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
