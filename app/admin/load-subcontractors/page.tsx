'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoadSubcontractorsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const res = await fetch('/api/admin/load-subcontractors')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error loading subcontractors')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cargar 221 Subcontratistas Reales de Labbe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400">
            Esta herramienta carga todos los 221 subcontratistas reales de Transportes Labbe desde el archivo de datos hacia Supabase.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500/40 text-green-300 p-4 rounded-lg flex gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{result.message}</p>
                <p className="text-sm">Total cargado: {result.count}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleLoad}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar Subcontratistas'
            )}
          </Button>

          <p className="text-xs text-slate-500">
            Nota: Una vez cargados, los datos aparecerán inmediatamente en la página de Transportistas (/admin/transportistas)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
