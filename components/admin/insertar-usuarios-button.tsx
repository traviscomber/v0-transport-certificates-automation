'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function InsertarUsuariosButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInsert = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/insert-usuarios')
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        // Recargar la página después de 2 segundos
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err) {
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

  return (
    <Button onClick={handleInsert} disabled={loading} variant="default">
      {loading ? 'Insertando...' : 'Insertar 6 Usuarios'}
    </Button>
  )
}
