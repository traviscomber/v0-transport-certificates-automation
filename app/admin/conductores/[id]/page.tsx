import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2, Calendar, CheckCircle2, FileText, Mail, Phone, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpBox } from "@/components/ui/help-box"

export const dynamic = "force-dynamic"

function getPrevisionalBadge(esPensionado: boolean | null | undefined) {
  if (esPensionado === true) {
    return { label: "Pensionado", className: "border-amber-200 bg-amber-50 text-amber-800" }
  }
  if (esPensionado === false) {
    return { label: "No pensionado", className: "border-sky-200 bg-sky-50 text-sky-800" }
  }
  return null
}

function getProfileCompletion(conductor: any) {
  const checks = [
    Boolean(conductor?.transportista_id || conductor?.rut_proveedor),
    Boolean(conductor?.rut),
    Boolean(conductor?.nombres),
    Boolean(conductor?.apellido_paterno),
    Boolean(conductor?.clase_licencia),
    Boolean(conductor?.numero_licencia),
    Boolean(conductor?.vencimiento_licencia),
    Boolean(conductor?.telefono || conductor?.email),
    Boolean(conductor?.direccion || conductor?.comuna || conductor?.ciudad),
    conductor?.es_pensionado === true
      ? Boolean(conductor?.numero_pension && conductor?.institucion_pension)
      : conductor?.es_pensionado === false
        ? Boolean(conductor?.numero_afp && conductor?.numero_isapre)
        : false,
    Boolean(conductor?.tipo_contratacion),
  ]

  const completed = checks.filter(Boolean).length
  const total = checks.length
  const percent = Math.round((completed / total) * 100)

  return {
    completed,
    total,
    percent,
    label: percent >= 90 ? "Completo" : percent >= 60 ? "Parcial" : "Pendiente",
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No registrado"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-CL").format(date)
}

function fieldValue(value: string | null | undefined) {
  return value && value.trim() ? value : "No registrado"
}

export default async function ConductorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: conductor, error } = await supabase
    .from("conductores")
    .select("*, transportistas(razon_social, rut)")
    .eq("id", params.id)
    .single()

  if (error || !conductor) {
    notFound()
  }

  const previsionalBadge = getPrevisionalBadge(conductor.es_pensionado)
  const completion = getProfileCompletion(conductor)
  const isPensionado = conductor.es_pensionado === true

  const mainFields = [
    { label: "RUT", value: conductor.rut },
    { label: "Nombres", value: conductor.nombres },
    { label: "Apellido paterno", value: conductor.apellido_paterno },
    { label: "Apellido materno", value: conductor.apellido_materno },
    { label: "Empresa", value: conductor.transportistas?.razon_social || conductor.transportista_id || "Sin asignar" },
    { label: "RUT empresa", value: conductor.transportistas?.rut || conductor.rut_proveedor },
    { label: "Fecha de nacimiento", value: formatDate(conductor.fecha_nacimiento) },
  ]

  const contactFields = [
    { label: "Telefono", value: conductor.telefono },
    { label: "Email", value: conductor.email },
    { label: "Direccion", value: conductor.direccion },
    { label: "Comuna", value: conductor.comuna },
    { label: "Ciudad", value: conductor.ciudad },
  ]

  const licenseFields = [
    { label: "Clase", value: conductor.clase_licencia },
    { label: "Numero", value: conductor.numero_licencia },
    { label: "Vencimiento", value: formatDate(conductor.vencimiento_licencia) },
  ]

  const previsionalFields = isPensionado
    ? [
        { label: "Institucion de pension", value: conductor.institucion_pension },
        { label: "Numero de pension", value: conductor.numero_pension },
      ]
    : [
        { label: "Numero de AFP", value: conductor.numero_afp },
        { label: "Numero de ISAPRE/Fonasa", value: conductor.numero_isapre },
      ]

  const missingFields = [
    !conductor.transportista_id && !conductor.rut_proveedor ? "Asignar empresa" : null,
    !conductor.rut ? "Completar RUT" : null,
    !conductor.nombres ? "Completar nombres" : null,
    !conductor.apellido_paterno ? "Completar apellido paterno" : null,
    !conductor.clase_licencia ? "Completar clase de licencia" : null,
    !conductor.numero_licencia ? "Completar numero de licencia" : null,
    !conductor.vencimiento_licencia ? "Completar vencimiento de licencia" : null,
    !conductor.telefono && !conductor.email ? "Completar al menos un dato de contacto" : null,
    !conductor.direccion && !conductor.comuna && !conductor.ciudad ? "Completar direccion o ubicacion" : null,
    isPensionado === true && (!conductor.institucion_pension || !conductor.numero_pension) ? "Completar datos de pension" : null,
    isPensionado === false && (!conductor.numero_afp || !conductor.numero_isapre) ? "Completar datos previsionales" : null,
    !conductor.tipo_contratacion ? "Completar tipo de contratacion" : null,
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/conductores">
          <Button variant="ghost" size="icon" title="Volver a la lista de conductores">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold tracking-tight">
            {conductor.nombres} {conductor.apellido_paterno}
          </h1>
          <p className="text-muted-foreground">Ficha operativa del conductor con datos reales de cumplimiento</p>
        </div>
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          <Link href={`/admin/conductores/${conductor.id}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
        </div>
      </div>

      <HelpBox
        variant="info"
        title="Detalle operativo"
        description="Esta vista resume identidad, licencia, contacto y situacion previsional usando solo datos reales ya cargados en la base."
        tips={[
          "El chip previsional refleja si el conductor queda marcado como pensionado o no pensionado.",
          "La completitud sirve para detectar perfiles listos y perfiles que aun requieren carga.",
          "No se crean ni borran datos desde esta pantalla; solo se consulta y se dirige a edicion segura.",
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Perfil</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  completion.label === "Completo"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : completion.label === "Parcial"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                }
              >
                {completion.label}
              </Badge>
              <span className="text-2xl font-bold">{completion.percent}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Situacion previsional</div>
            <div className="mt-1">
              {previsionalBadge ? (
                <Badge variant="outline" className={previsionalBadge.className}>
                  {previsionalBadge.label}
                </Badge>
              ) : (
                <Badge variant="outline">Sin definir</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Campos completos</div>
            <div className="text-2xl font-bold">
              {completion.completed}/{completion.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Estado</div>
            <div className="mt-1">
              <Badge variant="outline" className={conductor.is_active ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                {conductor.is_active ? "En servicio" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Datos principales
            </CardTitle>
            <CardDescription>Identidad y empresa asociada</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {mainFields.map((field) => (
              <div key={field.label} className="rounded-lg border bg-slate-50/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</div>
                <div className="mt-1 text-sm font-medium">{fieldValue(field.value)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Completitud de perfil
            </CardTitle>
            <CardDescription>Campos que ya estan listos y lo que falta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="rounded-lg border bg-slate-50/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Campos completos</div>
                <div className="mt-1 text-sm font-medium">
                  {completion.completed} de {completion.total}
                </div>
              </div>
              <div className="rounded-lg border bg-slate-50/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Revision</div>
                <div className="mt-1 text-sm font-medium">
                  {missingFields.length ? "Pendiente de ajuste" : "Listo para operacion"}
                </div>
              </div>
            </div>

            {missingFields.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Falta completar</div>
                <div className="flex flex-wrap gap-2">
                  {missingFields.map((item) => (
                    <Badge key={item} variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Perfil completo segun los datos cargados en el sistema.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Licencia y contratacion
            </CardTitle>
            <CardDescription>Vigencia operativa y clase de licencia</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {licenseFields.map((field) => (
              <div key={field.label} className="rounded-lg border bg-slate-50/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</div>
                <div className="mt-1 text-sm font-medium">{fieldValue(field.value)}</div>
              </div>
            ))}
            <div className="rounded-lg border bg-slate-50/50 p-3 sm:col-span-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de contratacion</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.tipo_contratacion)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Situacion previsional
            </CardTitle>
            <CardDescription>Datos guardados para cumplimiento en Chile</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {previsionalBadge ? (
                <Badge variant="outline" className={previsionalBadge.className}>
                  {previsionalBadge.label}
                </Badge>
              ) : (
                <Badge variant="outline">Sin definir</Badge>
              )}
            </div>
            {previsionalFields.map((field) => (
              <div key={field.label} className="rounded-lg border bg-slate-50/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</div>
                <div className="mt-1 text-sm font-medium">{fieldValue(field.value)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contacto
            </CardTitle>
            <CardDescription>Canales disponibles para operacion y seguimiento</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Telefono</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.telefono)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Email</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.email)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Direccion</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.direccion)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Comuna</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.comuna)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Ciudad</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.ciudad)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Licencia</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(conductor.numero_licencia)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
