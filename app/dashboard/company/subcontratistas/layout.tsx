import type { ReactNode } from 'react'
import { SiiVerificationProgress } from '@/components/sii-verification-progress'

export default function SubcontractorsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <SiiVerificationProgress />
      {children}
    </div>
  )
}
