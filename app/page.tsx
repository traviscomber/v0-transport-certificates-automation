"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir directamente al dashboard
    router.push('/dashboard/company')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <p className="text-white text-xl">Redirigiendo...</p>
    </div>
  )
}
