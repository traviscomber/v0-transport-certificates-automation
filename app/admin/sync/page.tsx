'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSync = async () => {
    try {
      setLoading(true)
      setMessage('Sincronizando 92 conductores faltantes...')
      
      const res = await fetch('/api/admin/sync-missing-drivers', {
        method: 'POST',
      })
      
      const data = await res.json()
      setMessage(JSON.stringify(data, null, 2))
      
      // Reload drivers page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/company/drivers')
      }, 2000)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Sincronizar Conductores</h1>
      
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? 'Sincronizando...' : 'Sincronizar 92 Conductores Faltantes'}
      </button>

      {message && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-sm whitespace-pre-wrap">
          {message}
        </pre>
      )}
    </div>
  )
}
