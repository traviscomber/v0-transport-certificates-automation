import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader } from 'lucide-react'

interface AddConductorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transportistas: Array<{ rut: string; nombre: string }>
  currentEjecutiva?: string
}

export function AddConductorModal({
  isOpen,
  onClose,
  onSuccess,
  transportistas,
  currentEjecutiva
}: AddConductorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut_proveedor: '',
    clase_licencia: 'B',
    is_active: true
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.rut.trim()) {
        throw new Error('RUT es requerido')
      }
      if (!formData.nombres.trim()) {
        throw new Error('Nombres es requerido')
      }
      if (!formData.rut_proveedor) {
        throw new Error('Debe seleccionar un transportista/subcontratista')
      }

      const response = await fetch('/api/conductores/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear conductor')
      }

      // Success - reset and close
      setFormData({
        rut: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        rut_proveedor: '',
        clase_licencia: 'B',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Conductor</DialogTitle>
          <DialogDescription>
            Completa los campos requeridos para agregar un nuevo conductor a tu flota
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
            <div className="space-y-2">
              <Label htmlFor="rut">RUT *</Label>
              <Input
                id="rut"
                placeholder="12345678-9"
                value={formData.rut}
                onChange={(e) => handleChange('rut', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                placeholder="Juan Carlos"
                value={formData.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
              <Input
                id="apellido_paterno"
                placeholder="González"
                value={formData.apellido_paterno}
                onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido_materno">Apellido Materno</Label>
              <Input
                id="apellido_materno"
                placeholder="López"
                value={formData.apellido_materno}
                onChange={(e) => handleChange('apellido_materno', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rut_proveedor">Transportista/Subcontratista *</Label>
            <Select value={formData.rut_proveedor} onValueChange={(value) => handleChange('rut_proveedor', value)}>
              <SelectTrigger disabled={loading}>
                <SelectValue placeholder="Selecciona un transportista" />
              </SelectTrigger>
              <SelectContent>
                {transportistas.map((t) => (
                  <SelectItem key={t.rut} value={t.rut}>
                    {t.nombre} ({t.rut})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clase_licencia">Clase de Licencia</Label>
              <Select value={formData.clase_licencia} onValueChange={(value) => handleChange('clase_licencia', value)}>
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Clase A</SelectItem>
                  <SelectItem value="B">Clase B</SelectItem>
                  <SelectItem value="C">Clase C</SelectItem>
                  <SelectItem value="D">Clase D</SelectItem>
                  <SelectItem value="E">Clase E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Estado</Label>
              <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => handleChange('is_active', value === 'active')}>
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

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
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Creando...' : 'Crear Conductor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
