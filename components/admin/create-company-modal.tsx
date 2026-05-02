'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanyCreated: (company: { id: string; name: string }) => void
}

export function CreateCompanyModal({ isOpen, onClose, onCompanyCreated }: CreateCompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    email: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          tax_id: formData.tax_id,
          email: formData.email,
          service_type: 'TRANSPORTE',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear la empresa')
      }

      const newCompany = await response.json()
      onCompanyCreated(newCompany)
      setFormData({ name: '', tax_id: '', email: '' })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nueva Empresa</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">
              Nombre de la Empresa
            </label>
            <Input
              type="text"
              name="name"
              placeholder="Ej: Mi Transportista S.A."
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">
              RUT / Tax ID
            </label>
            <Input
              type="text"
              name="tax_id"
              placeholder="Ej: 12345678-9"
              value={formData.tax_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">
              Email
            </label>
            <Input
              type="email"
              name="email"
              placeholder="empresa@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Creando...' : 'Crear Empresa'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
