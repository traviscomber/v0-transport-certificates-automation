"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"

export default function EditarConductorPage() {
  const router = useRouter()
  const params = useParams()
  const conductorId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportistas, setTransportistas] = useState<any[]>([])
  const [conductor, setConductor] = useState<any | null>(null)
  const [isPensionado, setIsPensionado] = useState<boolean | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      if (!supabase || !conductorId) {
        setError("No se pudo cargar el formulario de edicion.")
        setLoading(false)
        return
      }

      const [conductorResult, transportistasResult]: any = await Promise.all([
        supabase.from("conductores").select("*").eq("id", conductorId).single(),
        supabase.from("transportistas").select("id, razon_social, rut").eq("is_active", true).order("razon_social"),
      ])

      if (conductorResult.error || !conductorResult.data) {
        setError(conductorResult.error?.message || "Conductor no encontrado")
        setLoading(false)
        return
      }

      setConductor(conductorResult.data)
      setIsPensionado(conductorResult.data.es_pensionado ?? null)
      setTransportistas(transportistasResult.data || [])
      setLoading(false)
    }

    loadData()
  }, [conductorId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const transportistaId = formData.get("transportista_id") as string
    const selectedTransportista = transportistas.find((t) => t.id === transportistaId)
    const tipoContratacion = formData.get("tipo_contratacion") as string || null

    if (isPensionado === null) {
      setError("Debes seleccionar si el conductor es pensionado o no pensionado.")
      setSaving(false)
      return
    }

    if (!tipoContratacion) {
      setError("Debes seleccionar el tipo de contratacion.")
      setSaving(false)
      return
    }

    if (isPensionado) {
      const institucionPension = formData.get("institucion_pension") as string || null
      const numeroPension = formData.get("numero_pension") as string || null
      if (!institucionPension || !numeroPension) {
        setError("Completa institucion de pension y numero de pension para continuar.")
        setSaving(false)
        return
      }
    } else {
      const numeroAfp = formData.get("numero_afp") as string || null
      const numeroIsapre = formData.get("numero_isapre") as string || null
      if (!numeroAfp || !numeroIsapre) {
        setError("Completa numero de AFP y numero de ISAPRE/Fonasa para continuar.")
        setSaving(false)
        return
      }
    }

    const payload = {
      id: conductorId,
      transportista_id: transportistaId,
      rut_proveedor: selectedTransportista?.rut || null,
      rut: formData.get("rut") as string,
      nombres: formData.get("nombres") as string,
      apellido_paterno: formData.get("apellido_paterno") as string,
      apellido_materno: formData.get("apellido_materno") as string || null,
      clase_licencia: formData.get("clase_licencia") as string || null,
      is_active: conductor.is_active,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string || null,
      direccion: formData.get("direccion") as string || null,
      comuna: formData.get("comuna") as string || null,
      ciudad: formData.get("ciudad") as string || null,
      telefono: formData.get("telefono") as string || null,
      email: formData.get("email") as string || null,
      numero_licencia: formData.get("numero_licencia") as string || null,
      vencimiento_licencia: formData.get("vencimiento_licencia") as string || null,
      es_pensionado: isPensionado,
      numero_afp: isPensionado ? null : (formData.get("numero_afp") as string || null),
      numero_isapre: isPensionado ? null : (formData.get("numero_isapre") as string || null),
      tipo_contratacion: tipoContratacion,
      numero_pension: isPensionado ? (formData.get("numero_pension") as string || null) : null,
      institucion_pension: isPensionado ? (formData.get("institucion_pension") as string || null) : null,
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Error de conexion: no se pudo conectar a la base de datos")
      setSaving(false)
      return
    }

    const { error: updateError } = await (supabase as any)
      .from("conductores")
      .update(payload)
      .eq("id", conductorId)

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !conductor) {
    return (
      <div className="space-y-4">
        <Link href="/admin/conductores">
          <Button variant="ghost" size="icon" title="Volver a la lista de conductores">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const previsionalLabel = isPensionado ? "Pensionado" : "No pensionado"
  const previsionalSummary = isPensionado
    ? "Se registran institucion de pension y numero de pension. No se solicitan AFP ni ISAPRE/Fonasa."
    : "Se registran AFP e ISAPRE/Fonasa. No se solicitan datos de pension."

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/conductores">
          <Button variant="ghost" size="icon" title="Volver a la lista de conductores">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Conductor</h1>
          <p className="text-muted-foreground">
            Actualiza los datos del conductor y su situacion previsional sin perder trazabilidad
          </p>
        </div>
      </div>

      <HelpBox
        variant="info"
        title="Edicion segura"
        description="Solo actualizas datos existentes. La seleccion previsional controla que campos se muestran y que informacion queda guardada para cumplimiento en Chile."
        tips={[
          "Pensionado: se editan institucion de pension y numero de pension.",
          "No pensionado: se editan numero de AFP y numero de ISAPRE/Fonasa.",
          "El tipo de contratacion sigue siendo obligatorio para mantener el registro completo.",
        ]}
      />

      <Card className="border-slate-200 bg-slate-50/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Situacion previsional actual</CardTitle>
          <CardDescription>
            {previsionalSummary}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{previsionalLabel}</p>
            <p className="text-sm text-muted-foreground">
              Esta clasificacion define como se muestran los campos y evita guardar datos que no correspondan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isPensionado ? "default" : "outline"}
              onClick={() => setIsPensionado(true)}
            >
              Pensionado
            </Button>
            <Button
              type="button"
              variant={!isPensionado ? "default" : "outline"}
              onClick={() => setIsPensionado(false)}
            >
              No pensionado
            </Button>
          </div>
        </CardContent>
      </Card>

      <form key={conductor.id} onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>Informacion del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="Puedes corregir los datos del conductor sin cambiar su identidad operativa ni su acceso al sistema." />
              <div className="space-y-2">
                <Label htmlFor="transportista_id">Transportista *</Label>
                <select
                  id="transportista_id"
                  name="transportista_id"
                  defaultValue={conductor.transportista_id || ""}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Haz clic aqui y elige una empresa...</option>
                  {transportistas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.razon_social} ({t.rut})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">La empresa donde trabaja este conductor</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT *</Label>
                <Input id="rut" name="rut" defaultValue={conductor.rut || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input id="nombres" name="nombres" defaultValue={conductor.nombres || ""} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                  <Input id="apellido_paterno" name="apellido_paterno" defaultValue={conductor.apellido_paterno || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input id="apellido_materno" name="apellido_materno" defaultValue={conductor.apellido_materno || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" defaultValue={conductor.fecha_nacimiento || ""} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Licencia de Conducir</CardTitle>
              <CardDescription>Datos de la licencia profesional del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="Asegurate de mantener la clase de licencia y la fecha de vencimiento siempre al dia." />
              <div className="space-y-2">
                <Label htmlFor="clase_licencia">Clase de Licencia</Label>
                <select
                  id="clase_licencia"
                  name="clase_licencia"
                  defaultValue={conductor.clase_licencia || ""}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar clase...</option>
                  <option value="A-1">A-1 (Motocicletas)</option>
                  <option value="A-2">A-2 (Taxis colectivos)</option>
                  <option value="A-3">A-3 (Taxis)</option>
                  <option value="A-4">A-4 (Transporte escolar, hasta 17 asientos)</option>
                  <option value="A-5">A-5 (Transporte de pasajeros, mas de 17 asientos)</option>
                  <option value="B">B (Vehiculos particulares)</option>
                  <option value="C">C (Vehiculos de carga simple)</option>
                  <option value="D">D (Maquinaria agricola)</option>
                  <option value="E">E (Maquinaria de construccion)</option>
                  <option value="F">F (Vehiculos de emergencia)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_licencia">Numero de Licencia</Label>
                <Input id="numero_licencia" name="numero_licencia" defaultValue={conductor.numero_licencia || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencimiento_licencia">Fecha de Vencimiento</Label>
                <Input id="vencimiento_licencia" name="vencimiento_licencia" type="date" defaultValue={conductor.vencimiento_licencia || ""} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {isPensionado ? "Informacion de Pension" : "Informacion de Impuestos y Prevision"}
              </CardTitle>
              <CardDescription>
                {isPensionado
                  ? "Datos del sistema previsional de pension"
                  : "Datos de impuestos y aportes previsionales"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPensionado ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institucion_pension">Institucion de Pension</Label>
                    <Input id="institucion_pension" name="institucion_pension" defaultValue={conductor.institucion_pension || ""} placeholder="ej: AFP Profesional, INP" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_pension">Numero de Pension</Label>
                    <Input id="numero_pension" name="numero_pension" defaultValue={conductor.numero_pension || ""} placeholder="Numero de afiliacion o cuenta" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratacion</Label>
                    <select
                      id="tipo_contratacion"
                      name="tipo_contratacion"
                      defaultValue={conductor.tipo_contratacion || ""}
                      required
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="honorarios">Honorarios</option>
                      <option value="plazo_fijo">Plazo Fijo</option>
                      <option value="indefinido">Indefinido</option>
                      <option value="obra">Por Obra</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="numero_afp">Numero de AFP</Label>
                    <Input id="numero_afp" name="numero_afp" defaultValue={conductor.numero_afp || ""} placeholder="Numero de afiliacion AFP" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_isapre">Numero de ISAPRE/Fonasa</Label>
                    <Input id="numero_isapre" name="numero_isapre" defaultValue={conductor.numero_isapre || ""} placeholder="Numero de afiliacion de salud" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratacion</Label>
                    <select
                      id="tipo_contratacion"
                      name="tipo_contratacion"
                      defaultValue={conductor.tipo_contratacion || ""}
                      required
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="honorarios">Honorarios</option>
                      <option value="plazo_fijo">Plazo Fijo</option>
                      <option value="indefinido">Indefinido</option>
                      <option value="obra">Por Obra</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>Informacion de contacto del conductor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input id="telefono" name="telefono" type="tel" defaultValue={conductor.telefono || ""} placeholder="+56 9 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={conductor.email || ""} placeholder="conductor@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Direccion</Label>
                  <Input id="direccion" name="direccion" defaultValue={conductor.direccion || ""} placeholder="Av. Principal 123" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input id="comuna" name="comuna" defaultValue={conductor.comuna || ""} placeholder="Santiago" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input id="ciudad" name="ciudad" defaultValue={conductor.ciudad || ""} placeholder="Santiago" />
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
