"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"

export default function EditarConductorPage() {
  const router = useRouter()
  const params = useParams()
  const conductorId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conductor, setConductor] = useState<any>(null)
  const [isPensionado, setIsPensionado] = useState<boolean | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      if (!supabase) {
        setError("Error de conexión: no se pudo conectar a la base de datos")
        setLoading(false)
        return
      }

      try {
        const { data: conductorData, error: conductorError } = await supabase
          .from("conductores")
          .select("*")
          .eq("id", conductorId)
          .single()

        if (conductorError) {
          setError("No se pudo cargar el conductor")
          setLoading(false)
          return
        }

        setConductor(conductorData)
        const data = conductorData as any
        if (data.es_pensionado !== undefined && data.es_pensionado !== null) {
          setIsPensionado(data.es_pensionado)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [conductorId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      rut: formData.get("rut") as string,
      nombres: formData.get("nombres") as string,
      apellido_paterno: formData.get("apellido_paterno") as string,
      apellido_materno: formData.get("apellido_materno") as string || null,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string || null,
      direccion: formData.get("direccion") as string || null,
      comuna: formData.get("comuna") as string || null,
      ciudad: formData.get("ciudad") as string || null,
      telefono: formData.get("telefono") as string || null,
      email: formData.get("email") as string || null,
      clase_licencia: formData.get("clase_licencia") as string || null,
      numero_licencia: formData.get("numero_licencia") as string || null,
      vencimiento_licencia: formData.get("vencimiento_licencia") as string || null,
      es_pensionado: isPensionado,
      numero_afp: isPensionado ? null : (formData.get("numero_afp") as string || null),
      numero_isapre: isPensionado ? null : (formData.get("numero_isapre") as string || null),
      tipo_contratacion: formData.get("tipo_contratacion") as string || null,
      numero_pension: isPensionado ? (formData.get("numero_pension") as string || null) : null,
      institucion_pension: isPensionado ? (formData.get("institucion_pension") as string || null) : null,
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Error de conexión: no se pudo conectar a la base de datos")
      setSaving(false)
      return
    }

    const supabaseAny = supabase as any
    const result = await supabaseAny
      .from("conductores")
      .update(data)
      .eq("id", conductorId)
    const updateError = result?.error

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push("/admin/conductores")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!conductor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/conductores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Conductor no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/conductores">
          <Button variant="ghost" size="icon" title="Volver a la lista de conductores">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Conductor</h1>
          <p className="text-muted-foreground">
            {conductor.nombres} {conductor.apellido_paterno}
          </p>
        </div>
      </div>

      <HelpBox
        variant="info"
        title="Editar situación previsional"
        description="Puedes actualizar la situación previsional del conductor si fue registrado sin esta información."
        tips={[
          "Si el conductor no tiene una situación previsional asignada, selecciona ahora.",
          "Cambiar de Pensionado a No Pensionado (o viceversa) actualizará los campos requeridos.",
          "Guarda los cambios al finalizar."
        ]}
      />

      {isPensionado === null && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setIsPensionado(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👴</span> Pensionado
              </CardTitle>
              <CardDescription>Recibe pensión previsional</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Marcar como pensionado/jubilado
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => setIsPensionado(false)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👨</span> No Pensionado
              </CardTitle>
              <CardDescription>Activo en el sistema previsional</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Marcar como activo laboralmente
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>Información del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT *</Label>
                <Input 
                  id="rut" 
                  name="rut" 
                  placeholder="12.345.678-9"
                  defaultValue={conductor.rut || ''}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input 
                  id="nombres" 
                  name="nombres" 
                  placeholder="Juan Carlos"
                  defaultValue={conductor.nombres || ''}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                  <Input 
                    id="apellido_paterno" 
                    name="apellido_paterno" 
                    placeholder="Perez"
                    defaultValue={conductor.apellido_paterno || ''}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input 
                    id="apellido_materno" 
                    name="apellido_materno" 
                    placeholder="Gonzalez"
                    defaultValue={conductor.apellido_materno || ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input 
                  id="fecha_nacimiento" 
                  name="fecha_nacimiento" 
                  type="date"
                  defaultValue={conductor.fecha_nacimiento || ''}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Licencia de Conducir</CardTitle>
              <CardDescription>Datos de la licencia profesional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clase_licencia">Clase de Licencia</Label>
                <select 
                  id="clase_licencia" 
                  name="clase_licencia"
                  defaultValue={conductor.clase_licencia || ''}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar clase...</option>
                  <option value="A-1">A-1 (Motocicletas)</option>
                  <option value="A-2">A-2 (Taxis colectivos)</option>
                  <option value="A-3">A-3 (Taxis)</option>
                  <option value="A-4">A-4 (Transporte escolar)</option>
                  <option value="A-5">A-5 (Transporte de pasajeros)</option>
                  <option value="B">B (Vehículos particulares)</option>
                  <option value="C">C (Vehículos de carga)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_licencia">Número de Licencia</Label>
                <Input 
                  id="numero_licencia" 
                  name="numero_licencia" 
                  placeholder="123456789"
                  defaultValue={conductor.numero_licencia || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencimiento_licencia">Fecha de Vencimiento</Label>
                <Input 
                  id="vencimiento_licencia" 
                  name="vencimiento_licencia" 
                  type="date"
                  defaultValue={conductor.vencimiento_licencia || ''}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Situación Previsional</CardTitle>
              <CardDescription>Selecciona si el conductor es pensionado o está activo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado Previsional *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPensionado(true)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isPensionado === true
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 bg-background hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Pensionado</div>
                    <div className="text-sm opacity-75">Jubilado/Pensión</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPensionado(false)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isPensionado === false
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 bg-background hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">No Pensionado</div>
                    <div className="text-sm opacity-75">Activo/Trabajando</div>
                  </button>
                </div>
                <input type="hidden" name="es_pensionado" value={isPensionado === true ? 'true' : 'false'} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {isPensionado ? 'Información de Pensión' : isPensionado === false ? 'Impuestos y Previsión' : 'Situación Previsional'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPensionado ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institucion_pension">Institución de Pensión</Label>
                    <Input 
                      id="institucion_pension" 
                      name="institucion_pension" 
                      placeholder="ej: AFP Profesional, INP"
                      defaultValue={conductor.institucion_pension || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_pension">Número de Pensión</Label>
                    <Input 
                      id="numero_pension" 
                      name="numero_pension" 
                      placeholder="Número de afiliación"
                      defaultValue={conductor.numero_pension || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratación</Label>
                    <select 
                      id="tipo_contratacion" 
                      name="tipo_contratacion"
                      defaultValue={conductor.tipo_contratacion || ''}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="honorarios">Honorarios</option>
                      <option value="plazo_fijo">Plazo Fijo</option>
                      <option value="indefinido">Indefinido</option>
                    </select>
                  </div>
                </div>
              ) : isPensionado === false ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="numero_afp">Número de AFP</Label>
                    <Input 
                      id="numero_afp" 
                      name="numero_afp" 
                      placeholder="Número de afiliación"
                      defaultValue={conductor.numero_afp || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_isapre">Número de ISAPRE/Fonasa</Label>
                    <Input 
                      id="numero_isapre" 
                      name="numero_isapre" 
                      placeholder="Número de afiliación"
                      defaultValue={conductor.numero_isapre || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratación</Label>
                    <select 
                      id="tipo_contratacion" 
                      name="tipo_contratacion"
                      defaultValue={conductor.tipo_contratacion || ''}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="honorarios">Honorarios</option>
                      <option value="plazo_fijo">Plazo Fijo</option>
                      <option value="indefinido">Indefinido</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Selecciona una situación previsional arriba para completar esta sección</p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    name="telefono" 
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    defaultValue={conductor.telefono || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="conductor@email.com"
                    defaultValue={conductor.email || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input 
                    id="direccion" 
                    name="direccion" 
                    placeholder="Av. Principal 123"
                    defaultValue={conductor.direccion || ''}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input id="comuna" name="comuna" placeholder="Santiago" defaultValue={conductor.comuna || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input id="ciudad" name="ciudad" placeholder="Santiago" defaultValue={conductor.ciudad || ''} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/admin/conductores">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
