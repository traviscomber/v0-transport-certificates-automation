import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader } from 'lucide-react'

interface AddConductorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transportistas?: Array<{ rut: string; nombre: string }>
  currentEjecutiva?: string
}

export function AddConductorModal({
  isOpen,
  onClose,
  onSuccess,
  transportistas: initialTransportistas = [],
}: AddConductorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [transportistas, setTransportistas] = useState<Array<{ rut: string; nombre: string }>>(initialTransportistas)
  const [successData, setSuccessData] = useState<{
    conductor: any
    instructions?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut_proveedor: '',
    clase_licencia: 'B',
    is_active: true,
  })

  useEffect(() => {
    if (isOpen && transportistas.length === 0) {
      const loadTransportistas = async () => {
        try {
          const response = await fetch('/api/company/data')
          const data = await response.json()
          const subs = (data.subcontractors || []).map((s: any) => ({
            rut: s.rut,
            nombre: s.nombre,
          }))
          setTransportistas(subs)
          console.log('[v0] Loaded', subs.length, 'transportistas')
        } catch (err) {
          console.error('[v0] Error loading transportistas:', err)
        }
      }
      loadTransportistas()
    }
  }, [isOpen, transportistas.length])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
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
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear conductor')
      }

      setSuccessData({
        conductor: data.conductor,
        instructions: data.instructions,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSuccess = () => {
    setFormData({
      rut: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      rut_proveedor: '',
      clase_licencia: 'B',
      is_active: true,
    })
    setSuccessData(null)
    onSuccess()
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (successData) {
            handleCloseSuccess()
          } else {
            onClose()
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {successData ? (
          <>
            <DialogHeader>
              <DialogTitle>Conductor Creado Exitosamente</DialogTitle>
              <DialogDescription>El conductor ha sido habilitado para acceder y subir documentos.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-md border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">
                  {successData.conductor.nombres} {successData.conductor.apellido_paterno}
                </p>
                <p className="mt-1 text-xs text-green-700">RUT: {successData.conductor.rut}</p>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Credenciales no visibles por seguridad. El conductor debe usar la clave entregada por el equipo Labbe.
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="mb-2 text-xs font-semibold text-blue-900">Instrucciones:</p>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>El conductor queda habilitado para subir documentos.</li>
                  <li>Debe usar sus credenciales oficiales para acceder.</li>
                  <li>No se muestran contraseñas en esta pantalla por seguridad.</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseSuccess} className="w-full">
                Entendido
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Conductor</DialogTitle>
              <DialogDescription>Completa los campos requeridos para agregar un nuevo conductor a tu flota.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
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
                    placeholder="Gonzalez"
                    value={formData.apellido_paterno}
                    onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input
                    id="apellido_materno"
                    placeholder="Lopez"
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
                      <SelectItem value="A2">Clase A2</SelectItem>
                      <SelectItem value="A5">Clase A5</SelectItem>
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? 'Creando...' : 'Crear Conductor'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
