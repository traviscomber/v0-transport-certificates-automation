'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface CreateApplicantFormProps {
  companies: Array<{ id: string; razon_social: string }>
}

export function CreateApplicantForm({ companies }: CreateApplicantFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rut: '',
    licenseType: 'A2',
    companyId: companies[0]?.id || '',
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
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          rut: formData.rut,
          license_type: formData.licenseType,
          company_id: formData.companyId,
          status: 'new',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el postulante')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/postulantes')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el postulante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Postulante</h1>
        <p className="text-muted-foreground mt-1">
          Completa el formulario para registrar un nuevo candidato en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Postulante</CardTitle>
          <CardDescription>
            Datos básicos requeridos para iniciar el proceso de onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  Postulante registrado exitosamente. Redirigiendo...
                </AlertDescription>
              </Alert>
            )}

            {/* Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Nombre
                </label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="Ej: Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Apellido
                </label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Ej: Pérez García"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  RUT
                </label>
                <Input
                  type="text"
                  name="rut"
                  placeholder="Ej: 12345678-9"
                  value={formData.rut}
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
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
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

            {/* License and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Tipo de Licencia
                </label>
                <select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  disabled={isLoading}
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A5">A5</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Empresa / Transportista
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  disabled={isLoading || companies.length === 0}
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.razon_social}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Registrando...' : 'Registrar Postulante'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
