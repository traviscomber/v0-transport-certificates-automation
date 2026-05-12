import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader, Copy, Check } from 'lucide-react'

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
  currentEjecutiva
}: AddConductorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [transportistas, setTransportistas] = useState<Array<{ rut: string; nombre: string }>>(initialTransportistas)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [successData, setSuccessData] = useState<{
    conductor: any
    password: string
    instructions: string
  } | null>(null)
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rut_proveedor: '',
    clase_licencia: 'B',
    is_active: true
  })

  // Load transportistas from API on modal open
  useEffect(() => {
    if (isOpen && transportistas.length === 0) {
      const loadTransportistas = async () => {
        try {
          const response = await fetch('/api/company/data')
          const data = await response.json()
          const subs = (data.subcontractors || []).map((s: any) => ({
            rut: s.rut,
            nombre: s.nombre
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

      // Show success with password
      setSuccessData({
        conductor: data.conductor,
        password: data.password,
        instructions: data.instructions
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPassword = () => {
    if (successData?.password) {
      navigator.clipboard.writeText(successData.password)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const handleCloseSuccess = () => {
    // Reset and close
    setFormData({
      rut: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      rut_proveedor: '',
      clase_licencia: 'B',
      is_active: true
    })
    setSuccessData(null)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (successData) {
          handleCloseSuccess()
        } else {
          onClose()
        }
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        {successData ? (
          <>
            <DialogHeader>
              <DialogTitle>Conductor Creado Exitosamente</DialogTitle>
              <DialogDescription>
                El conductor ha sido habilitado para acceder y subir documentos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-900">
                  {successData.conductor.nombres} {successData.conductor.apellido_paterno}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  RUT: {successData.conductor.rut}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Contraseña</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-100 rounded border border-gray-300 font-mono text-center text-lg tracking-widest">
                    {successData.password}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="gap-2"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs font-semibold text-blue-900 mb-2">Instrucciones:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• El conductor usa su RUT + esta contraseña para acceder</li>
                  <li>• Acceso inmediato habilitado para subir documentos</li>
                  <li>• Comparte estas credenciales de forma segura</li>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
