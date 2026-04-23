'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InsertarUsuariosPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInsert = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/insert-usuarios', {
        method: 'GET',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al insertar usuarios')
        return
      }

      setResult(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Insertar 6 Usuarios de Labbe</CardTitle>
            <CardDescription>
              Haz clic en el botón para crear los 6 usuarios ejecutivos de Transportes Labbe en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleInsert}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Insertando...' : 'Insertar 6 Usuarios'}
            </Button>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded">
                <p className="font-semibold">Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-500/10 border border-green-500 text-green-700 p-4 rounded space-y-2">
                <p className="font-semibold">✓ Usuarios insertados exitosamente</p>
                {result.usuarios && Array.isArray(result.usuarios) && (
                  <div className="text-sm space-y-1 mt-3">
                    <p className="font-medium">Usuarios creados:</p>
                    {result.usuarios.map((user: any, i: number) => (
                      <div key={i} className="ml-4 text-xs">
                        • {user.full_name} ({user.rut})
                      </div>
                    ))}
                  </div>
                )}
                {result.count && (
                  <p className="text-sm mt-2">Total: {result.count} usuarios</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded">
          <p className="text-sm text-muted-foreground">
            Una vez insertados, ve a <strong>/dashboard/company/usuarios</strong> para ver los usuarios en la lista.
          </p>
        </div>
      </div>
    </div>
  )
}
