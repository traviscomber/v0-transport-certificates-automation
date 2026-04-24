'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticPage() {
  const [config, setConfig] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setConfig({
      url: url || 'NOT SET',
      keyLength: key ? key.length : 0,
      keyStart: key ? key.substring(0, 50) : 'NOT SET',
    })

    // Try to fetch from Supabase directly
    if (url && key) {
      fetch(`${url}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'apikey': key,
        },
      })
        .then((res) => {
          setTestResult(`Status: ${res.status} ${res.statusText}`)
        })
        .catch((err) => {
          setTestResult(`Error: ${err.message}`)
        })
        .finally(() => setLoading(false))
    } else {
      setTestResult('ENV vars not set')
      setLoading(false)
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Diagnostic</h1>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <h2>Connection Test:</h2>
      <p>{loading ? 'Testing...' : testResult}</p>
    </div>
  )
}
