"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, HelpCircle } from "lucide-react"
import Link from "next/link"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"

export default function NuevoConductorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportistas, setTransportistas] = useState<any[]>([])
  const [step, setStep] = useState<'pensionado' | 'form'>('pensionado')
  const [isPensionado, setIsPensionado] = useState<boolean | null>(null)
  const previsionalLabel = isPensionado ? 'Pensionado' : 'No pensionado'
  const previsionalSummary = isPensionado
    ? 'Se registran institucion de pension y numero de pension. No se solicitan AFP ni ISAPRE/Fonasa.'
    : 'Se registran AFP e ISAPRE/Fonasa. No se solicitan datos de pension.'
  const previsionalChecklist = isPensionado
    ? [
        'Guardar institucion de pension',
        'Guardar numero de pension',
        'Definir tipo de contratacion',
      ]
    : [
        'Guardar numero de AFP',
        'Guardar numero de ISAPRE/Fonasa',
        'Definir tipo de contratacion',
      ]

  useEffect(() => {
    async function loadTransportistas() {
      const supabase = createClient()
      if (!supabase) {
        console.error('[v0] Supabase client not available')
        return
      }
      const { data } = await supabase
        .from("transportistas")
        .select("id, razon_social, rut")
        .eq("is_active", true)
        .order("razon_social")
      setTransportistas(data || [])
    }
    loadTransportistas()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const transportistaId = formData.get("transportista_id") as string
    const selectedTransportista = transportistas.find((t) => t.id === transportistaId)
    const tipoContratacion = formData.get("tipo_contratacion") as string || null

    if (isPensionado === null) {
      setError("Debes seleccionar si el conductor es pensionado o no pensionado.")
      setLoading(false)
      return
    }

    if (!tipoContratacion) {
      setError("Debes seleccionar el tipo de contratacion.")
      setLoading(false)
      return
    }

    if (isPensionado) {
      const institucionPension = formData.get("institucion_pension") as string || null
      const numeroPension = formData.get("numero_pension") as string || null
      if (!institucionPension || !numeroPension) {
        setError("Completa institucion de pension y numero de pension para continuar.")
        setLoading(false)
        return
      }
    } else {
      const numeroAfp = formData.get("numero_afp") as string || null
      const numeroIsapre = formData.get("numero_isapre") as string || null
      if (!numeroAfp || !numeroIsapre) {
        setError("Completa numero de AFP y numero de ISAPRE/Fonasa para continuar.")
        setLoading(false)
        return
      }
    }

    const data = {
      transportista_id: transportistaId,
      rut_proveedor: selectedTransportista?.rut || null,
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
      tipo_contratacion: tipoContratacion,
      numero_pension: isPensionado ? (formData.get("numero_pension") as string || null) : null,
      institucion_pension: isPensionado ? (formData.get("institucion_pension") as string || null) : null,
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Error de conexión: no se pudo conectar a la base de datos")
      setLoading(false)
      return
    }
    
    const { error: insertError } = await supabase
      .from("conductores")
      .insert(data as any)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/admin/conductores")
    router.refresh()
  }

  // Step 1: Pensionado Selection
  if (step === 'pensionado') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/conductores">
            <Button variant="ghost" size="icon" title="Volver a la lista de conductores">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Conductor</h1>
            <p className="text-muted-foreground">
              Paso 1: Determinar situación previsional
            </p>
          </div>
        </div>

        <HelpBox
          variant="info"
          title="¿Cuál es la situación previsional?"
          description="Es fundamental determinar si el conductor es pensionado o no pensionado, ya que esto afecta el tratamiento de impuestos y descuentos legales."
          tips={[
            "PENSIONADO: Recibe pensión de AFP, INP u otra institución previsional.",
            "NO PENSIONADO: Está activo en el sistema previsional y aporta a AFP o similar.",
            "Esta clasificación determina los campos de documentación e impuestos requeridos."
          ]}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => { setIsPensionado(true); setStep('form'); }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👴</span> Pensionado
              </CardTitle>
              <CardDescription>Recibe pensión previsional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">El conductor está jubilado y recibe pensión de:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AFP (Administradora de Fondos de Pensiones)</li>
                <li>• INP (Instituto Nacional de Pensiones)</li>
                <li>• Otros fondos de pensión</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => { setIsPensionado(false); setStep('form'); }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👨</span> No Pensionado
              </CardTitle>
              <CardDescription>Activo en el sistema previsional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">El conductor aporta al sistema de pensiones:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Aporta a AFP o sistema previsional</li>
                <li>• Tiene derecho a descuentos legales</li>
                <li>• Requiere documentación de impuestos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep('pensionado')}
          title="Volver a seleccionar situación previsional"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Conductor</h1>
          <p className="text-muted-foreground">
            Paso 2: Registro de datos {isPensionado ? '(Pensionado)' : '(No Pensionado)'}
          </p>
        </div>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="steps"
        title="Como registrar un conductor"
        description="Un conductor es la persona que maneja los vehiculos. Aqui registras sus datos y licencia:"
        steps={[
          {
            step: 1,
            title: "Selecciona el transportista",
            description: "Primero elige a que empresa pertenece este conductor usando el menu desplegable."
          },
          {
            step: 2,
            title: "Datos personales",
            description: "Ingresa el RUT, nombres y apellidos del conductor. El RUT es obligatorio."
          },
          {
            step: 3,
            title: "Licencia de conducir",
            description: "Registra la clase de licencia, numero y fecha de vencimiento. Es muy importante para el cumplimiento."
          },
          {
            step: 4,
            title: "Datos de contacto",
            description: "Agrega telefono y email para poder comunicarte con el conductor."
          }
        ]}
      />

      <Card className="border-slate-200 bg-slate-50/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Situacion previsional confirmada</CardTitle>
          <CardDescription>
            Esta clasificacion define que datos se piden y como queda guardado el registro para cumplimiento en Chile.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{previsionalLabel}</p>
            <p className="text-sm text-muted-foreground">{previsionalSummary}</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {previsionalChecklist.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos personales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>Informacion del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="Primero selecciona la empresa de transporte a la que pertenece este conductor. Si no aparece, debes registrarla primero." />
              <div className="space-y-2">
                <Label htmlFor="transportista_id">Transportista *</Label>
                <select 
                  id="transportista_id" 
                  name="transportista_id"
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
                <Input 
                  id="rut" 
                  name="rut" 
                  placeholder="12.345.678-9"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input 
                  id="nombres" 
                  name="nombres" 
                  placeholder="Juan Carlos"
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
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input 
                    id="apellido_materno" 
                    name="apellido_materno" 
                    placeholder="Gonzalez"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input 
                  id="fecha_nacimiento" 
                  name="fecha_nacimiento" 
                  type="date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Licencia */}
          <Card>
            <CardHeader>
              <CardTitle>Licencia de Conducir</CardTitle>
              <CardDescription>Datos de la licencia profesional del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="La licencia es muy importante. Revisa que la clase sea la correcta para el tipo de vehiculo que maneja y que la fecha de vencimiento este al dia." />
              <div className="space-y-2">
                <Label htmlFor="clase_licencia">Clase de Licencia</Label>
                <select 
                  id="clase_licencia" 
                  name="clase_licencia"
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
                <Input 
                  id="numero_licencia" 
                  name="numero_licencia" 
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencimiento_licencia">Fecha de Vencimiento</Label>
                <Input 
                  id="vencimiento_licencia" 
                  name="vencimiento_licencia" 
                  type="date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Impuestos y Previsión */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {isPensionado ? 'Información de Pensión' : 'Información de Impuestos y Previsión'}
              </CardTitle>
              <CardDescription>
                {isPensionado 
                  ? 'Datos del sistema previsional de pensión'
                  : 'Datos de impuestos y aportes previsionales'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPensionado ? (
                // Campos para PENSIONADO
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institucion_pension">Institución de Pensión</Label>
                    <Input 
                      id="institucion_pension" 
                      name="institucion_pension" 
                      placeholder="ej: AFP Profesional, INP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_pension">Número de Pensión</Label>
                    <Input 
                      id="numero_pension" 
                      name="numero_pension" 
                      placeholder="Número de afiliación o cuenta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratación</Label>
                  <select
                    id="tipo_contratacion"
                    name="tipo_contratacion"
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
                // Campos para NO PENSIONADO
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="numero_afp">Número de AFP</Label>
                    <Input 
                      id="numero_afp" 
                      name="numero_afp" 
                      placeholder="Número de afiliación AFP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_isapre">Número de ISAPRE/Fonasa</Label>
                    <Input 
                      id="numero_isapre" 
                      name="numero_isapre" 
                      placeholder="Número de afiliación de salud"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contratacion">Tipo de Contratación</Label>
                  <select
                    id="tipo_contratacion"
                    name="tipo_contratacion"
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

          {/* Contacto */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>Informacion de contacto del conductor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input 
                    id="telefono" 
                    name="telefono" 
                    type="tel"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="conductor@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Direccion</Label>
                  <Input 
                    id="direccion" 
                    name="direccion" 
                    placeholder="Av. Principal 123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input id="comuna" name="comuna" placeholder="Santiago" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input id="ciudad" name="ciudad" placeholder="Santiago" />
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
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Conductor
          </Button>
        </div>
      </form>
    </div>
  )
}
