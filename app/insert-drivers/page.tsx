'use client'

import { useState } from 'react'

export default function InsertDriversPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleInsert = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/insert-drivers', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      window.location.href = '/operacional/conductores'
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Cargar Conductores</h1>
        <p className="text-gray-600 mb-6">Haz clic para insertar todos los 292 conductores en la base de datos</p>
        
        <button
          onClick={handleInsert}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition mb-4"
        >
          {loading ? 'Cargando...' : 'Cargar Conductores'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg text-sm ${result.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
