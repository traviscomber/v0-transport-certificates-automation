'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SubcontractorsPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/subcontractors/login')
  }, [router])

  return null
}
