import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader, Trash2 } from 'lucide-react'

interface Executive {
  id: string
  email: string
  full_name?: string
  nombres?: string
  apellido_paterno?: string
  cargo?: string
}

interface EditSubcontractorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subcontractor?: {
    id: string
    razon_social?: string
    nombre?: string
    rut: string
    region?: string
    comuna?: string
    telefono?: string
    email?: string
    nombre_contacto?: string
    representante_legal?: string
    direccion?: string
    is_active: boolean
    assigned_executive_id?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export function EditSubcontractorModal({
  isOpen,
  onClose,
  onSuccess,
  subcontractor
}: EditSubcontractorModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loadingExecutives, setLoadingExecutives] = useState(false)
  const [formData, setFormData] = useState({
    razon_social: '',
    rut: '',
    region: '',
    comuna: '',
    telefono: '',
    email: '',
    nombre_contacto: '',
    is_active: true,
    assigned_executive_id: ''
  })

  // Fetch executives when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExecutives()
    }
  }, [isOpen])

  const fetchExecutives = async () => {
    setLoadingExecutives(true)
    try {
      const response = await fetch('/api/admin/labbe-executives')
      const data = await response.json()
      if (data.executives) {
        setExecutives(data.executives)
      }
    } catch (err) {
      // Silent fail - executives dropdown will be empty
    } finally {
      setLoadingExecutives(false)
    }
  }

  // Update form data when subcontractor changes
  useEffect(() => {
    if (subcontractor) {
      setFormData({
        razon_social: subcontractor?.razon_social || subcontractor?.nombre || '',
        rut: subcontractor?.rut || '',
        region: subcontractor?.region || '',
        comuna: subcontractor?.comuna || '',
        telefono: subcontractor?.telefono || '',
        email: subcontractor?.email || '',
        nombre_contacto: subcontractor?.nombre_contacto || subcontractor?.representante_legal || '',
        is_active: subcontractor?.is_active !== false,
        assigned_executive_id: subcontractor?.assigned_executive_id || ''
      })
    }
  }, [subcontractor, isOpen])

  const handleInputChange = (field: string, value: any) => {
    // Handle special value for clearing executive assignment
    if (field === 'assigned_executive_id' && value === '__clear__') {
      setFormData(prev => ({ ...prev, [field]: '' }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subcontractor?.id) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/transportistas/${subcontractor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar subcontratista')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!subcontractor?.id) return

    setDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/transportistas/${subcontractor.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar subcontratista')
      }

      onSuccess()
      onClose()
      setShowDeleteConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea eliminar este subcontratista? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-900">
                {formData.razon_social} ({formData.rut})
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting && <Loader className="w-4 h-4 animate-spin" />}
                {deleting ? 'Eliminando...' : 'Eliminar Subcontratista'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Editar Subcontratista</DialogTitle>
              <DialogDescription>
                {`Modifica los datos de ${subcontractor?.razon_social || ''}`}
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
                  />
                </div>

                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    value={formData.rut}
                    onChange={(e) => handleInputChange('rut', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input
                    id="comuna"
                    value={formData.comuna}
                    onChange={(e) => handleInputChange('comuna', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    disabled={loading}
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
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="nombre_contacto">Nombre Contacto</Label>
                  <Input
                    id="nombre_contacto"
                    value={formData.nombre_contacto}
                    onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="assigned_executive_id">Ejecutiva Asignada</Label>
                  <Select
                    value={formData.assigned_executive_id}
                    onValueChange={(value) => handleInputChange('assigned_executive_id', value)}
                    disabled={loading || loadingExecutives}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingExecutives ? "Cargando..." : "Seleccionar ejecutiva"} />
                    </SelectTrigger>
                    <SelectContent>
                      {executives.length > 0 && formData.assigned_executive_id && (
                        <SelectItem value="__clear__">Sin asignar</SelectItem>
                      )}
                      {executives.map((exec) => (
                        <SelectItem key={exec.id} value={exec.id}>
                          {exec.full_name || `${exec.nombres || ''} ${exec.apellido_paterno || ''}`.trim()} - {exec.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || deleting}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
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
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
