'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncPage() {
  const router = useRouter()

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch('/api/sync-all-drivers')
        const data = await res.json()
        console.log('Sync result:', data)
        // Redirect to conductores after 2 seconds
        setTimeout(() => {
          router.push('/admin/conductores')
        }, 2000)
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
    sync()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground text-lg">Cargando 292 conductores...</p>
        <p className="text-muted-foreground text-sm mt-2">Serás redirigido a la página de conductores en breve</p>
      </div>
    </div>
  )
}
