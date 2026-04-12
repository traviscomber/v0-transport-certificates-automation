'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [data, setData] = useState<any>(null)

  const handleSeed = async () => {
    setLoading(true)
    setStatus('loading')
    setMessage('Cargando datos en Supabase...')

    try {
      const response = await fetch('/api/admin/seed-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(result.error || 'Error al cargar los datos')
      } else {
        setStatus('success')
        setMessage('Datos cargados exitosamente en Supabase')
        setData(result)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-700 bg-slate-950">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Panel de Administración - Seed Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-300 text-sm">
                Este panel cargará todos los datos en Supabase:
              </p>
              <ul className="text-slate-400 text-sm mt-3 space-y-1 ml-4">
                <li>• 221 subcontratistas (empresas transportistas)</li>
                <li>• 291 conductores</li>
                <li>• 12 tipos de documentos predefinidos</li>
              </ul>
            </div>

            <Button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-6 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Cargando datos...
                </>
              ) : (
                'Ejecutar Seed Database'
              )}
            </Button>

            {status !== 'idle' && (
              <div className={`p-4 rounded-lg border-2 flex gap-3 ${
                status === 'success'
                  ? 'bg-green-950 border-green-700'
                  : status === 'error'
                  ? 'bg-red-950 border-red-700'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                {status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${
                    status === 'success'
                      ? 'text-green-400'
                      : status === 'error'
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}>
                    {message}
                  </p>
                  {data && (
                    <pre className="text-xs text-slate-400 mt-2 bg-slate-800 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
              <p>Esta operación es segura y puede ejecutarse múltiples veces (usa IF NOT EXISTS).</p>
              <p className="mt-1">Después de ejecutarse, los datos estarán disponibles en todo el portal.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
