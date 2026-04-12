'use client'

import { useEffect, useState } from 'react'

export default function LoadDriversPage() {
  const [status, setStatus] = useState('Cargando conductores...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await fetch('/api/load-all-drivers')
        const data = await res.json()
        
        if (data.success) {
          setStatus(`✓ Éxito: ${data.inserted} conductores nuevos insertados. Total: ${data.total}`)
          
          // Redirect to conductores page after 2 seconds
          setTimeout(() => {
            window.location.href = '/admin/conductores'
          }, 2000)
        } else {
          setStatus(`Error: ${data.error}`)
        }
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    loadDrivers()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        {loading && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        )}
        <p className="text-white text-xl font-semibold">{status}</p>
        <p className="text-gray-400 mt-2 text-sm">Se redirigirá a conductores en unos momentos...</p>
      </div>
    </div>
  )
}
