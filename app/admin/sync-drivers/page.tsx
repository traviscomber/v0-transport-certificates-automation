'use client'

import { useState } from 'react'

export default function SyncDriversPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('[v0] Calling sync-drivers endpoint...')
      const response = await fetch('/api/admin/sync-drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log('[v0] Sync response:', data)

      if (!response.ok) {
        setError(data.error || 'Sync failed')
      } else {
        setResult(data)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[v0] Sync error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sync Drivers to Supabase</h1>

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <p className="text-slate-300 mb-6">
            This will sync all drivers from the local allDriversData to the Supabase conductores table.
            This ensures the database has consistent driver information for document uploads.
          </p>

          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Syncing...' : 'Start Sync'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2">Error:</h3>
            <pre className="text-sm overflow-auto">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
            <h3 className="font-bold mb-2">✅ Sync Successful!</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
