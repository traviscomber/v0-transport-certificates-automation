'use client'

import { DocuFleetTopbar } from './docufleet-topbar'
import { DocuFleetSidebar } from './docufleet-sidebar'

interface DocuFleetLayoutProps {
  children: React.ReactNode
}

export function DocuFleetLayout({ children }: DocuFleetLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DocuFleetTopbar />
      <div className="flex">
        <DocuFleetSidebar />
        <main className="flex-1 ml-64 mt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
