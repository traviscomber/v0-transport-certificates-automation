import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Driver {
  id: string
  rut: string
  nombres: string
  apellido_paterno?: string
  apellido_materno?: string
  rut_proveedor?: string
  clase_licencia?: string
  is_active?: boolean
  nombre_subcontratista?: string
  es_pensionado?: boolean
}

interface EditConductorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  driver: Driver | null
  transportistas: Array<{ rut: string; nombre: string; ejecutivo_nombre?: string }>
}

export function EditConductorModal({
  isOpen,
  onClose,
  onSuccess,
  driver,
  transportistas
}: EditConductorModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string>('')
  const [ejecutivas, setEjecutivas] = useState<Array<{ id: string; full_name: string }>>([])
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut_proveedor: '',
    clase_licencia: 'B',
    is_active: true,
    es_pensionado: false
  })
  
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Load ejecutivas from executive_staff table
  useEffect(() => {
    const loadEjecutivas = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('executive_staff')
          .select('id, full_name')
          .eq('is_active', true)
          .order('full_name')
        
        if (error) {
          console.error('Error loading ejecutivas:', error)
        } else {
          setEjecutivas(data || [])
        }
      } catch (err) {
        console.error('Error loading ejecutivas:', err)
      }
    }
    
    if (isOpen) {
      loadEjecutivas()
    }
  }, [isOpen])

  useEffect(() => {
    if (driver && isOpen) {
      setFormData({
        rut: driver.rut || '',
        nombres: driver.nombres || '',
        apellido_paterno: driver.apellido_paterno || '',
        apellido_materno: driver.apellido_materno || '',
        rut_proveedor: driver.rut_proveedor || '',
        clase_licencia: driver.clase_licencia || 'B',
        is_active: driver.is_active !== false,
        es_pensionado: driver.es_pensionado || false
      })
      setError('')
    }
  }, [driver, isOpen])

  useEffect(() => {
    if (driver && isOpen && transportistas.length > 0) {
      // Find transportista and get ejecutiva full name from executive_staff
      const selectedTransportista = transportistas.find(t => t.rut === driver.rut_proveedor)
      const ejecutivoNombre = selectedTransportista?.ejecutivo_nombre
      
      if (ejecutivoNombre && ejecutivas.length > 0) {
        // Find ejecutiva by matching name
        const matchedEjecutiva = ejecutivas.find(e => 
          e.full_name.toLowerCase().includes(ejecutivoNombre.toLowerCase())
        )
        setSelectedEjecutiva(matchedEjecutiva?.full_name || 'Sin asignar')
      } else {
        setSelectedEjecutiva('Sin asignar')
      }
    }
  }, [driver?.rut_proveedor, transportistas, ejecutivas])

  // When user selects a different transportista in the form
  useEffect(() => {
    if (formData.rut_proveedor && transportistas.length > 0 && ejecutivas.length > 0) {
      const selectedTransportista = transportistas.find(t => t.rut === formData.rut_proveedor)
      const ejecutivoNombre = selectedTransportista?.ejecutivo_nombre
      
      if (ejecutivoNombre) {
        const matchedEjecutiva = ejecutivas.find(e => 
          e.full_name.toLowerCase().includes(ejecutivoNombre.toLowerCase())
        )
        setSelectedEjecutiva(matchedEjecutiva?.full_name || 'Sin asignar')
      } else {
        setSelectedEjecutiva('Sin asignar')
      }
    }
  }, [formData.rut_proveedor, transportistas, ejecutivas])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver?.id) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/conductores/${driver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar conductor')
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
    if (!driver?.id) return

    setDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/conductores/${driver.id}?id=${driver.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar conductor')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Conductor</DialogTitle>
          <DialogDescription>
            {`Modifica los datos del conductor ${driver?.nombres || ''}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {showDeleteConfirm ? (
            <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-semibold text-red-900">
                ¿Estás seguro de que deseas eliminar este conductor?
              </p>
              <p className="text-xs text-red-800">
                Esta acción eliminará todos los registros asociados (autenticación, licencias, documentos).
              </p>
              <div className="flex gap-2">
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
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">RUT</Label>
                  <Input
                    value={formData.rut}
                    onChange={(e) => setFormData({...formData, rut: e.target.value})}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Nombres *</Label>
                  <Input
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Apellido Paterno</Label>
                  <Input
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Apellido Materno</Label>
                  <Input
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Transportista/Subcontratista *</Label>
                <Select 
                  value={formData.rut_proveedor} 
                  onValueChange={(value) => {
                    setFormData({...formData, rut_proveedor: value})
                    const selectedTransportista = transportistas.find(t => t.rut === value)
                    setSelectedEjecutiva(selectedTransportista?.ejecutivo_nombre || 'Sin asignar')
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un transportista" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportistas.map(t => (
                      <SelectItem key={t.rut} value={t.rut}>
                        {t.nombre} ({t.rut})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Ejecutiva Asignada</Label>
                <Select 
                  value={selectedEjecutiva} 
                  onValueChange={(value) => setSelectedEjecutiva(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona ejecutiva" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sin asignar">Sin asignar</SelectItem>
                    {ejecutivas.map(ejecutiva => (
                      <SelectItem key={ejecutiva.id} value={ejecutiva.full_name}>
                        {ejecutiva.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Situación Previsional</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, es_pensionado: true})}
                    className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                      formData.es_pensionado === true
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-sm">Pensionado</div>
                    <div className="text-xs opacity-90">Jubilado</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, es_pensionado: false})}
                    className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                      formData.es_pensionado === false
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-sm">No Pensionado</div>
                    <div className="text-xs opacity-90">Activo</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Clase de Licencia</Label>
                  <Select value={formData.clase_licencia} onValueChange={(value) => setFormData({...formData, clase_licencia: value})}>
                    <SelectTrigger className="mt-1">
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
                <div>
                  <Label className="text-sm font-semibold">Estado</Label>
                  <Select value={formData.is_active ? 'activo' : 'inactivo'} onValueChange={(value) => setFormData({...formData, is_active: value === 'activo'})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            {!showDeleteConfirm && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || deleting}
            >
              Cancelar
            </Button>
            {!showDeleteConfirm && (
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
