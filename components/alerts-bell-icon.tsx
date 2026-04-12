'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export function AlertsBellIcon() {
  const [alertCount, setAlertCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const { data } = await response.json()
          setAlertCount(data?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching alert count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlertCount()
    // Refresh alert count every 30 seconds
    const interval = setInterval(fetchAlertCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/admin/alerts" className="relative inline-block">
      <div className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-slate-300 hover:text-orange-500 transition-colors" />
        {alertCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-max">
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
      </div>
    </Link>
  )
}
