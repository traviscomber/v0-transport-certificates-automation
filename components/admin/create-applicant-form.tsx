'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function CreateApplicantForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Datos del postulante
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rut: '',
    licenseType: 'A2',
    // Datos de la empresa
    companyName: '',
    companyTaxId: '',
    companyEmail: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validar que todos los campos estén completos
      if (!formData.firstName || !formData.lastName || !formData.rut || !formData.email) {
        throw new Error('Por favor completa todos los datos del postulante')
      }
      if (!formData.companyName || !formData.companyTaxId) {
        throw new Error('Por favor completa todos los datos de la empresa')
      }

      // Primero crear la empresa
      const companyResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
          tax_id: formData.companyTaxId,
          email: formData.companyEmail || null,
          service_type: 'TRANSPORTE',
        }),
      })

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json()
        throw new Error(errorData.error || 'Error al crear la empresa')
      }

      const companyData = await companyResponse.json()

      // Luego crear el postulante con la empresa creada
      const applicantResponse = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          rut: formData.rut,
          license_type: formData.licenseType,
          company_id: companyData.id,
          status: 'new',
        }),
      })

      if (!applicantResponse.ok) {
        throw new Error('Error al crear el postulante')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/postulantes')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar postulante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Postulante</h1>
        <p className="text-muted-foreground mt-1">
          Ingresa los datos del postulante y su empresa
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Postulante y empresa registrados exitosamente. Redirigiendo...
                </AlertDescription>
              </Alert>
            )}

            {/* Sección: Datos del Postulante */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Datos del Postulante</h2>
              <div className="space-y-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Nombre *
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="Ej: Juan"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Apellido *
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Ej: Pérez García"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* RUT y Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      RUT *
                    </label>
                    <Input
                      type="text"
                      name="rut"
                      placeholder="Ej: 12345678-9"
                      value={formData.rut}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Teléfono y Tipo de Licencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Teléfono (Opcional)
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+56 9 XXXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Tipo de Licencia *
                    </label>
                    <select
                      name="licenseType"
                      value={formData.licenseType}
                      onChange={handleChange}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      disabled={isLoading}
                      required
                    >
                      <option value="A1">A1 - Ciclomotor</option>
                      <option value="A2">A2 - Motocicleta</option>
                      <option value="A5">A5 - Moto de mayor potencia</option>
                      <option value="B">B - Automóvil</option>
                      <option value="C">C - Camión</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t pt-4" />

            {/* Sección: Datos de la Empresa */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Datos de la Empresa</h2>
              <div className="space-y-4">
                {/* Nombre y RUT de Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      Razón Social / Nombre Empresa *
                    </label>
                    <Input
                      type="text"
                      name="companyName"
                      placeholder="Ej: Transportes XYZ Ltda."
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      RUT Empresa *
                    </label>
                    <Input
                      type="text"
                      name="companyTaxId"
                      placeholder="Ej: 76543210-K"
                      value={formData.companyTaxId}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Email de Empresa */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                    Email de Empresa (Opcional)
                  </label>
                  <Input
                    type="email"
                    name="companyEmail"
                    placeholder="contacto@empresa.com"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Registrando...' : 'Registrar Postulante y Empresa'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/postulantes')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Próximos pasos:</strong> Después de registrar el postulante, el sistema iniciará automáticamente el chequeo de antecedentes y enviará un email con las instrucciones para subir documentos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
