'use client'

import { useState } from 'react'

export default function TestDBPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testInsert = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: '4',  // Aldo Bustamante
          file_name: 'test_document.pdf',
          document_type: 'Test Document',
          file_url: 'https://example.com/test.pdf'
        })
      })

      const data = await response.json()
      console.log('[v0] Test response:', data)
      setResult(data)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Test Database INSERT</h1>
      
      <button
        onClick={testInsert}
        disabled={loading}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 rounded-lg font-bold mb-8"
      >
        {loading ? 'Testing...' : 'Test INSERT to driver_documents'}
      </button>

      {result && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Result:</h2>
          <pre className="bg-slate-900 p-4 rounded text-green-400 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
