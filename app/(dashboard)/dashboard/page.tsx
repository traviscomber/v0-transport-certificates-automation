'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// /dashboard always redirects to /dashboard/company
// This ensures all users (ejecutivas, admin, etc.) end up at the company portal
export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/company')
  }, [router])

  return null
}
