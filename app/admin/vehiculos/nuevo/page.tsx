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

export default function NuevoVehiculoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportistas, setTransportistas] = useState<any[]>([])

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
    const data = {
      transportista_id: formData.get("transportista_id") as string,
      patente: (formData.get("patente") as string).toUpperCase(),
      tipo: formData.get("tipo") as string,
      marca: formData.get("marca") as string || null,
      modelo: formData.get("modelo") as string || null,
      ano: formData.get("ano") ? parseInt(formData.get("ano") as string) : null,
      color: formData.get("color") as string || null,
      numero_chasis: formData.get("numero_chasis") as string || null,
      numero_motor: formData.get("numero_motor") as string || null,
      capacidad_carga: formData.get("capacidad_carga") ? parseFloat(formData.get("capacidad_carga") as string) : null,
      unidad_carga: formData.get("unidad_carga") as string || "kg",
      tiene_gps: formData.get("tiene_gps") === "on",
      gps_id: formData.get("gps_id") as string || null,
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Error de conexión: no se pudo conectar a la base de datos")
      setLoading(false)
      return
    }
    const { error: insertError } = await supabase
      .from("vehiculos")
      .insert(data as any)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/admin/vehiculos")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/vehiculos">
          <Button variant="ghost" size="icon" title="Volver a la lista de vehiculos">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Vehiculo</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo vehiculo a la flota (camion, tracto, remolque, etc.)
          </p>
        </div>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="steps"
        title="Como registrar un vehiculo"
        description="Aqui registras los camiones, tractos, remolques y otros vehiculos de la flota:"
        steps={[
          {
            step: 1,
            title: "Selecciona el transportista",
            description: "Elige la empresa duena del vehiculo. Si no aparece, registrala primero."
          },
          {
            step: 2,
            title: "Ingresa la patente",
            description: "Escribe la patente del vehiculo (puede ser formato antiguo AB-1234 o nuevo ABCD-12)."
          },
          {
            step: 3,
            title: "Elige el tipo de vehiculo",
            description: "Selecciona si es camion, tracto camion, semi remolque, camioneta, furgon o rampla."
          },
          {
            step: 4,
            title: "Completa los detalles",
            description: "Agrega marca, modelo, ano, color y numeros de chasis/motor si los tienes."
          }
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos basicos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Vehiculo</CardTitle>
              <CardDescription>Informacion basica del vehiculo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="Selecciona la empresa duena del vehiculo y luego completa los datos basicos." />
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
                <p className="text-xs text-muted-foreground">La empresa propietaria de este vehiculo</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patente">Patente *</Label>
                <Input 
                  id="patente" 
                  name="patente" 
                  placeholder="ABCD12 o AB1234"
                  className="uppercase"
                  required 
                />
                <p className="text-xs text-muted-foreground">Escribe la patente sin guion. Ejemplo: BBGG12 o JK1234</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Vehiculo *</Label>
                <select 
                  id="tipo" 
                  name="tipo"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="Camion">Camion</option>
                  <option value="Tracto Camion">Tracto Camion</option>
                  <option value="Semi Remolque">Semi Remolque</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Furgon">Furgon</option>
                  <option value="Rampla">Rampla</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" name="marca" placeholder="Volvo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" name="modelo" placeholder="FH16" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Input id="ano" name="ano" type="number" min="1990" max="2030" placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" placeholder="Blanco" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identificacion */}
          <Card>
            <CardHeader>
              <CardTitle>Identificacion</CardTitle>
              <CardDescription>Numeros de serie y capacidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numero_chasis">Numero de Chasis</Label>
                <Input id="numero_chasis" name="numero_chasis" placeholder="VIN/Chasis" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_motor">Numero de Motor</Label>
                <Input id="numero_motor" name="numero_motor" placeholder="Motor ID" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacidad_carga">Capacidad de Carga</Label>
                  <Input id="capacidad_carga" name="capacidad_carga" type="number" step="0.01" placeholder="30000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidad_carga">Unidad</Label>
                  <select 
                    id="unidad_carga" 
                    name="unidad_carga"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ton">Toneladas (ton)</option>
                    <option value="m3">Metros cubicos (m3)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="tiene_gps" name="tiene_gps" className="rounded" />
                  <Label htmlFor="tiene_gps">Tiene GPS instalado</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps_id">ID GPS</Label>
                  <Input id="gps_id" name="gps_id" placeholder="GPS-001" />
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
          <Link href="/admin/vehiculos">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar Vehiculo
          </Button>
        </div>
      </form>
    </div>
  )
}
