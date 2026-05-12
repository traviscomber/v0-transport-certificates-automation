import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader } from 'lucide-react'

interface AddSubcontractorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSubcontractorModal({
  isOpen,
  onClose,
  onSuccess
}: AddSubcontractorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState({
    razon_social: '',
    rut: '',
    region: '',
    comuna: '',
    telefono: '',
    email: '',
    nombre_contacto: '',
    is_active: true
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.razon_social || !formData.rut) {
        throw new Error('Razón Social y RUT son requeridos')
      }

      const response = await fetch('/api/transportistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear subcontratista')
      }

      // Reset form
      setFormData({
        razon_social: '',
        rut: '',
        region: '',
        comuna: '',
        telefono: '',
        email: '',
        nombre_contacto: '',
        is_active: true
      })

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Subcontratista</DialogTitle>
          <DialogDescription>
            Completa los campos requeridos para agregar un nuevo subcontratista
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="razon_social">Razón Social *</Label>
              <Input
                id="razon_social"
                value={formData.razon_social}
                onChange={(e) => handleInputChange('razon_social', e.target.value)}
                required
                disabled={loading}
                placeholder="Nombre empresa"
              />
            </div>

            <div>
              <Label htmlFor="rut">RUT *</Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) => handleInputChange('rut', e.target.value)}
                required
                disabled={loading}
                placeholder="12345678-9"
              />
            </div>

            <div>
              <Label htmlFor="region">Región</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                disabled={loading}
                placeholder="Región"
              />
            </div>

            <div>
              <Label htmlFor="comuna">Comuna</Label>
              <Input
                id="comuna"
                value={formData.comuna}
                onChange={(e) => handleInputChange('comuna', e.target.value)}
                disabled={loading}
                placeholder="Comuna"
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={loading}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                placeholder="contacto@empresa.cl"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="nombre_contacto">Nombre Contacto</Label>
              <Input
                id="nombre_contacto"
                value={formData.nombre_contacto}
                onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                disabled={loading}
                placeholder="Nombre del contacto"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  disabled={loading}
                  className="rounded"
                />
                <span className="text-sm font-medium">Activo</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Subcontratista'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
