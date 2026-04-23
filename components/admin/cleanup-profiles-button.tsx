'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface Profile {
  id: string
  email: string
  full_name: string
  rut?: string
}

export function CleanupProfilesButton() {
  const [nonLabbeProfiles, setNonLabbeProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  useEffect(() => {
    fetchNonLabbeProfiles()
  }, [])

  const fetchNonLabbeProfiles = async () => {
    try {
      const response = await fetch('/api/admin/cleanup-profiles')
      const data = await response.json()
      setNonLabbeProfiles(data.profiles || [])
      console.log('[v0] Non-labbe profiles:', data.profiles)
    } catch (err) {
      console.error('[v0] Error fetching:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar ${nonLabbeProfiles.length} perfiles que no son @labbe.cl?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/cleanup-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_non_labbe' }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeleted(true)
        setNonLabbeProfiles([])
        console.log('[v0] Remaining profiles:', data.remaining)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err) {
      console.error('[v0] Error deleting:', err)
    } finally {
      setLoading(false)
    }
  }

  if (nonLabbeProfiles.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        ✓ Solo hay perfiles @labbe.cl
      </div>
    )
  }

  if (deleted) {
    return (
      <div className="text-sm text-green-600">
        ✓ Perfiles eliminados. Recargando...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
        <p className="text-sm font-medium text-yellow-900">
          {nonLabbeProfiles.length} perfiles NO-@labbe.cl encontrados:
        </p>
        <ul className="text-xs text-yellow-700 mt-2 space-y-1">
          {nonLabbeProfiles.map(p => (
            <li key={p.id}>{p.email} - {p.full_name}</li>
          ))}
        </ul>
      </div>
      <Button 
        onClick={handleDelete} 
        disabled={loading}
        variant="destructive"
        size="sm"
      >
        {loading ? 'Eliminando...' : 'Eliminar Perfiles No-Labbe'}
      </Button>
    </div>
  )
}
