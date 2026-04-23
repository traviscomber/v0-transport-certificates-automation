'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export function CleanAllUsersButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleClean = async () => {
    if (!window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los usuarios. ¿Estás seguro?')) {
      return
    }
    if (!window.confirm('CONFIRMA: Esto es irreversible. ¿Continuar?')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/clean-all-users', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: `✓ Eliminados todos los usuarios. Recargando...` })
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al limpiar usuarios' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  if (message?.type === 'success') {
    return (
      <Button disabled className="bg-green-600">
        ✓ {message.text}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClean}
        disabled={loading}
        variant="destructive"
        className="w-full"
      >
        {loading ? 'Limpiando...' : '🗑️ Limpiar Todos Los Usuarios'}
      </Button>
      {message?.type === 'error' && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{message.text}</p>
        </div>
      )}
    </div>
  )
}
