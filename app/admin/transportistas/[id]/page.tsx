import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2, CheckCircle2, FileText, Mail, Phone, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpBox } from "@/components/ui/help-box"

export const dynamic = "force-dynamic"

function getCompletion(transportista: any) {
  const checks = [
    Boolean(transportista?.rut),
    Boolean(transportista?.razon_social),
    Boolean(transportista?.representante_legal),
    Boolean(transportista?.telefono || transportista?.email),
    Boolean(transportista?.direccion || transportista?.comuna || transportista?.ciudad),
    Boolean(transportista?.giro),
    Boolean(transportista?.assigned_executive_id || transportista?.ejecutivo_nombre),
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

function fieldValue(value: string | null | undefined) {
  return value && value.trim() ? value : "No registrado"
}

export default async function TransportistaDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: transportista, error }, conductoresCountResult, vehiculosCountResult] = await Promise.all([
    supabase
      .from("transportistas")
      .select("*")
      .eq("id", params.id)
      .single(),
    supabase
      .from("conductores")
      .select("id", { count: "exact", head: true })
      .eq("transportista_id", params.id),
    supabase
      .from("vehiculos")
      .select("id", { count: "exact", head: true })
      .eq("transportista_id", params.id),
  ])

  if (error || !transportista) {
    notFound()
  }

  const completion = getCompletion(transportista)
  const conductoresCount = conductoresCountResult.count || 0
  const vehiculosCount = vehiculosCountResult.count || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/transportistas">
          <Button variant="ghost" size="icon" title="Volver a la lista de transportistas">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold tracking-tight">{transportista.razon_social}</h1>
          <p className="text-muted-foreground">Ficha operativa de la empresa con datos reales de cumplimiento</p>
        </div>
      </div>

      <HelpBox
        variant="info"
        title="Detalle de empresa"
        description="Esta vista resume identidad, contacto, ejecutiva y volumen operativo real sin crear ni borrar datos."
        tips={[
          "La completitud refleja el nivel de perfil configurado en la base.",
          "Los contadores muestran la carga real de conductores y vehiculos asociados.",
          "Puedes volver a la lista o editar desde los flujos existentes sin cambiar la data desde esta pantalla.",
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
            <div className="text-sm text-muted-foreground">Conductores</div>
            <div className="text-2xl font-bold">{conductoresCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Vehiculos</div>
            <div className="text-2xl font-bold">{vehiculosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Estado</div>
            <div className="mt-1">
              <Badge
                variant="outline"
                className={
                  transportista.is_active
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-slate-100 text-slate-700"
                }
              >
                {transportista.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos de la empresa
            </CardTitle>
            <CardDescription>Identidad legal y operativa</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {[
              { label: "RUT", value: transportista.rut },
              { label: "Razon social", value: transportista.razon_social },
              { label: "Nombre fantasia", value: transportista.nombre_fantasia },
              { label: "Giro", value: transportista.giro },
              { label: "Representante legal", value: transportista.representante_legal },
              { label: "RUT representante", value: transportista.representante_rut },
              { label: "Ejecutiva", value: transportista.ejecutivo_nombre || "Sin asignar" },
            ].map((field) => (
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
              Completitud del perfil
            </CardTitle>
            <CardDescription>Campos presentes en el registro</CardDescription>
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
                  {completion.label === "Completo" ? "Listo para operacion" : "Pendiente de ajuste"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-muted-foreground">
                Basado solo en datos reales ya cargados
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contacto
            </CardTitle>
            <CardDescription>Canales de contacto de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Telefono</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(transportista.telefono)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Email</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(transportista.email)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Direccion</div>
              <div className="mt-1 text-sm font-medium">{fieldValue(transportista.direccion)}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Comuna / Ciudad</div>
              <div className="mt-1 text-sm font-medium">
                {fieldValue([transportista.comuna, transportista.ciudad].filter(Boolean).join(" / "))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Volumen asociado
            </CardTitle>
            <CardDescription>Lectura operativa del tamaño de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Conductores</div>
              <div className="mt-1 text-sm font-medium">{conductoresCount}</div>
            </div>
            <div className="rounded-lg border bg-slate-50/50 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Vehiculos</div>
              <div className="mt-1 text-sm font-medium">{vehiculosCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
