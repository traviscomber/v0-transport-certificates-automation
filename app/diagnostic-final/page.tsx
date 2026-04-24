'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticPage() {
  const [results, setResults] = useState<{
    url?: string
    anonKey?: string
    urlReachable?: boolean
    authWorks?: boolean
    error?: string
  }>({})

  useEffect(() => {
    const test = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log('[v0] Testing with:', { url, anonKey: anonKey?.substring(0, 50) + '...' })

      setResults(prev => ({ ...prev, url, anonKey: anonKey?.substring(0, 50) + '...' }))

      // Test 1: Can we reach Supabase REST API directly?
      try {
        const response = await fetch(`${url}/rest/v1/`, {
          headers: {
            'apikey': anonKey!,
            'Authorization': `Bearer ${anonKey}`,
          },
        })
        console.log('[v0] REST API test response:', response.status)
        setResults(prev => ({ ...prev, urlReachable: response.status === 200 || response.status === 401 }))
      } catch (error) {
        console.error('[v0] REST API test failed:', error)
        setResults(prev => ({ ...prev, urlReachable: false, error: String(error) }))
      }

      // Test 2: Try to authenticate
      try {
        const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': anonKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'ocarrasco@labbe.cl',
            password: 'TempPassword123!',
          }),
        })
        console.log('[v0] Auth test response:', response.status)
        const data = await response.json()
        console.log('[v0] Auth response:', data)
        setResults(prev => ({ ...prev, authWorks: response.status === 200, error: data.error_description || data.error }))
      } catch (error) {
        console.error('[v0] Auth test failed:', error)
        setResults(prev => ({ ...prev, authWorks: false, error: String(error) }))
      }
    }

    test()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diagnostic Report</h1>

        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <ul className="space-y-2">
              <li>
                <span className={results.url ? 'text-green-400' : 'text-red-400'}>
                  {results.url ? '✓' : '✗'} URL configured
                </span>
              </li>
              <li>
                <span className={results.anonKey ? 'text-green-400' : 'text-red-400'}>
                  {results.anonKey ? '✓' : '✗'} Anon Key configured
                </span>
              </li>
              <li>
                <span className={results.urlReachable ? 'text-green-400' : 'text-red-400'}>
                  {results.urlReachable ? '✓' : '✗'} Supabase is reachable
                </span>
              </li>
              <li>
                <span className={results.authWorks ? 'text-green-400' : 'text-red-400'}>
                  {results.authWorks ? '✓' : '✗'} Authentication works
                </span>
              </li>
            </ul>
          </div>

          {results.error && (
            <div className="bg-red-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Error Details</h2>
              <p className="text-red-100">{results.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
