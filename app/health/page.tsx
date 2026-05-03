'use client'

import { useEffect, useState } from 'react'

export default function HealthPage() {
  const [status, setStatus] = useState<any>({
    home: 'checking...',
    dashboard: 'checking...',
    health_db: 'checking...',
    login_api: 'checking...',
  })

  useEffect(() => {
    const checkAll = async () => {
      const results: any = {}

      // Check homepage
      try {
        const res = await fetch('/', { method: 'HEAD' })
        results.home = res.ok ? '✅ OK' : `❌ ${res.status}`
      } catch (e) {
        results.home = '❌ Error'
      }

      // Check dashboard
      try {
        const res = await fetch('/dashboard/company', { method: 'HEAD' })
        results.dashboard = res.ok ? '✅ OK' : `❌ ${res.status}`
      } catch (e) {
        results.dashboard = '❌ Error'
      }

      // Check health endpoint
      try {
        const res = await fetch('/api/health/db')
        results.health_db = res.ok ? '✅ OK' : `❌ ${res.status}`
      } catch (e) {
        results.health_db = '❌ Error'
      }

      // Check login endpoint
      try {
        const res = await fetch('/api/auth/login-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rut: 'test', password: 'test' }),
        })
        results.login_api = `✅ ${res.status}`
      } catch (e) {
        results.login_api = '❌ Error'
      }

      setStatus(results)
    }

    checkAll()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Sistema Diagnostics</h1>
        
        <div className="space-y-4 text-white text-lg">
          <div className="bg-slate-800 p-4 rounded">
            <span>📍 Homepage:</span> <span className="float-right font-mono">{status.home}</span>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <span>📊 Dashboard:</span> <span className="float-right font-mono">{status.dashboard}</span>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <span>🔧 Health API:</span> <span className="float-right font-mono">{status.health_db}</span>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <span>🔐 Login API:</span> <span className="float-right font-mono">{status.login_api}</span>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 p-6 rounded text-white">
          <h2 className="text-xl font-bold mb-4">⚡ Quick Test</h2>
          <p className="mb-4">Try these URLs:</p>
          <ul className="space-y-2 font-mono text-sm">
            <li>🏠 <a href="/" className="text-orange-500 hover:underline">/</a> - Redirects to dashboard</li>
            <li>📊 <a href="/dashboard/company" className="text-orange-500 hover:underline">/dashboard/company</a> - Main dashboard</li>
            <li>🔧 <a href="/api/health/db" className="text-orange-500 hover:underline">/api/health/db</a> - DB connection check</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
