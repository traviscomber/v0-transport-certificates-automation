'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function InsertarUsuariosButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInsert = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/insert-usuarios')
      const data = await response.json()
      
      console.log('[v0] Response status:', response.status)
      console.log('[v0] Response data:', data)
      
      if (response.ok && data.created && data.created.length > 0) {
        setSuccess(true)
        console.log('[v0] Success, reloading in 2 seconds')
        // Recargar la página después de 2 segundos
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else if (data.errors && data.errors.length > 0) {
        // Show first error in detail
        const firstError = data.errors[0]
        setError(`${firstError.rut}: ${firstError.error}`)
        console.error('[v0] Errors:', data.errors)
      } else {
        setError(data.message || 'Error desconocido')
        console.error('[v0] Error from API:', data)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      console.error('[v0] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Button disabled className="bg-green-600">
        ✓ Usuarios insertados
      </Button>
    )
  }

  if (error) {
    return (
      <div className="flex gap-2 items-center">
        <Button onClick={handleInsert} disabled={loading} variant="destructive">
          {loading ? 'Insertando...' : 'Reintentar'}
        </Button>
        <span className="text-xs text-red-500">{error}</span>
      </div>
    )
  }

  return (
    <Button onClick={handleInsert} disabled={loading} variant="default">
      {loading ? 'Insertando...' : 'Insertar 6 Usuarios'}
    </Button>
  )
}
