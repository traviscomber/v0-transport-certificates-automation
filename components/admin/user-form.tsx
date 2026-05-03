'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface UserFormProps {
  user?: {
    id: string
    email: string
    full_name: string
    role: string
    phone?: string
    is_active: boolean
  }
  isCompanyContext?: boolean
  onSuccess?: () => void
}

export function UserForm({ user, isCompanyContext = false, onSuccess }: UserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    role: user?.role || 'dispatcher',
    phone: user?.phone || '',
    is_active: user?.is_active ?? true,
  })

  const roleOptions = isCompanyContext 
    ? ['dispatcher', 'driver']
    : ['admin', 'dispatcher', 'driver']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isCompanyContext ? '/api/company/users' : '/api/admin/users'
      const method = user ? 'PUT' : 'POST'
      const url = user ? `${endpoint}/${user.id}` : endpoint

      console.log('[v0] Submitting form:', { endpoint, method, url, formData })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('[v0] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
        console.error('[v0] API error:', errorMessage)
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      console.log('[v0] Success response:', responseData)

      if (onSuccess) {
        onSuccess()
      } else {
        router.back()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      console.error('[v0] Form submission error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</CardTitle>
        <CardDescription>
          {user 
            ? 'Actualiza los datos del usuario'
            : 'Crea un nuevo usuario en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!!user}
                required
                className="w-full px-3 py-2 border rounded-md bg-background disabled:bg-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              id="is_active"
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Usuario activo
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
