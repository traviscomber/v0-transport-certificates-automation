"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, HelpCircle } from "lucide-react"
import Link from "next/link"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"

export default function NuevoTransportistaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      rut: formData.get("rut") as string,
      razon_social: formData.get("razon_social") as string,
      nombre_fantasia: formData.get("nombre_fantasia") as string || null,
      direccion: formData.get("direccion") as string || null,
      comuna: formData.get("comuna") as string || null,
      ciudad: formData.get("ciudad") as string || null,
      telefono: formData.get("telefono") as string || null,
      email: formData.get("email") as string || null,
      representante_legal: formData.get("representante_legal") as string || null,
      representante_rut: formData.get("representante_rut") as string || null,
      giro: formData.get("giro") as string || null,
    }

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("transportistas")
      .insert(data)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/admin/transportistas")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/transportistas">
          <Button variant="ghost" size="icon" title="Volver a la lista de transportistas">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Transportista</h1>
          <p className="text-muted-foreground">
            Registra una nueva empresa de transporte
          </p>
        </div>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="steps"
        title="Como registrar un transportista"
        description="Un transportista es una empresa de transporte que presta servicios. Sigue estos pasos:"
        steps={[
          {
            step: 1,
            title: "Completa los datos obligatorios",
            description: "Los campos marcados con asterisco (*) son obligatorios: RUT de la empresa y Razon Social."
          },
          {
            step: 2,
            title: "Agrega informacion de contacto",
            description: "Llena la direccion, telefono y email para poder comunicarte con la empresa."
          },
          {
            step: 3,
            title: "Datos del representante legal",
            description: "Ingresa el nombre y RUT de la persona que representa legalmente a la empresa."
          },
          {
            step: 4,
            title: "Presiona 'Registrar Transportista'",
            description: "Cuando termines, haz clic en el boton verde para guardar los datos."
          }
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos de la empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
              <CardDescription>Informacion legal del transportista (los campos con * son obligatorios)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickHelp text="El RUT es el numero unico que identifica a la empresa ante el SII. Se escribe con puntos y guion, por ejemplo: 76.123.456-7" />
              <div className="space-y-2">
                <Label htmlFor="rut">RUT Empresa *</Label>
                <Input 
                  id="rut" 
                  name="rut" 
                  placeholder="76.123.456-7"
                  required 
                />
                <p className="text-xs text-muted-foreground">Escribe el RUT con puntos y guion</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razon_social">Razon Social *</Label>
                <Input 
                  id="razon_social" 
                  name="razon_social" 
                  placeholder="Transportes ABC Ltda."
                  required 
                />
                <p className="text-xs text-muted-foreground">El nombre legal de la empresa tal como aparece en el SII</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_fantasia">Nombre Fantasia</Label>
                <Input 
                  id="nombre_fantasia" 
                  name="nombre_fantasia" 
                  placeholder="Transportes ABC"
                />
                <p className="text-xs text-muted-foreground">El nombre comercial o como se conoce la empresa (opcional)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="giro">Giro</Label>
                <Input 
                  id="giro" 
                  name="giro" 
                  placeholder="Transporte de carga por carretera"
                />
                <p className="text-xs text-muted-foreground">La actividad economica principal de la empresa</p>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>Informacion de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="contacto@empresa.cl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Representante Legal */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Representante Legal</CardTitle>
              <CardDescription>Datos del representante legal de la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="representante_legal">Nombre Completo</Label>
                  <Input 
                    id="representante_legal" 
                    name="representante_legal" 
                    placeholder="Juan Perez Gonzalez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representante_rut">RUT Representante</Label>
                  <Input 
                    id="representante_rut" 
                    name="representante_rut" 
                    placeholder="12.345.678-9"
                  />
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
          <Link href="/admin/transportistas">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Transportista
          </Button>
        </div>
      </form>
    </div>
  )
}
