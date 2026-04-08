"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NuevoConductorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportistas, setTransportistas] = useState<any[]>([])

  useEffect(() => {
    async function loadTransportistas() {
      const supabase = createClient()
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
    }

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("conductores")
      .insert(data)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/admin/conductores")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/conductores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Conductor</h1>
          <p className="text-muted-foreground">
            Registra un nuevo conductor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos personales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>Informacion del conductor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transportista_id">Transportista *</Label>
                <select 
                  id="transportista_id" 
                  name="transportista_id"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar transportista...</option>
                  {transportistas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.razon_social} ({t.rut})
                    </option>
                  ))}
                </select>
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
              <CardDescription>Datos de la licencia profesional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
