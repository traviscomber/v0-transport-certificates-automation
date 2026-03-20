"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NuevoMandantePage() {
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
      contacto_nombre: formData.get("contacto_nombre") as string || null,
      contacto_email: formData.get("contacto_email") as string || null,
      contacto_telefono: formData.get("contacto_telefono") as string || null,
    }

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("mandantes")
      .insert(data)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/admin/mandantes")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/mandantes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Mandante</h1>
          <p className="text-muted-foreground">
            Registra una nueva empresa que contrata transporte
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos de la empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
              <CardDescription>Informacion del mandante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT Empresa *</Label>
                <Input 
                  id="rut" 
                  name="rut" 
                  placeholder="96.439.000-2"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razon_social">Razon Social *</Label>
                <Input 
                  id="razon_social" 
                  name="razon_social" 
                  placeholder="Walmart Chile S.A."
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_fantasia">Nombre Fantasia</Label>
                <Input 
                  id="nombre_fantasia" 
                  name="nombre_fantasia" 
                  placeholder="Walmart Chile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Direccion */}
          <Card>
            <CardHeader>
              <CardTitle>Direccion</CardTitle>
              <CardDescription>Ubicacion de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input 
                  id="direccion" 
                  name="direccion" 
                  placeholder="Av. Presidente Eduardo Frei Montalva 8301"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input id="comuna" name="comuna" placeholder="Quilicura" />
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
                  placeholder="+56 2 2200 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="proveedores@walmart.cl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contacto Principal</CardTitle>
              <CardDescription>Persona de contacto en la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Nombre Contacto</Label>
                  <Input 
                    id="contacto_nombre" 
                    name="contacto_nombre" 
                    placeholder="Maria Lopez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email Contacto</Label>
                  <Input 
                    id="contacto_email" 
                    name="contacto_email" 
                    type="email"
                    placeholder="mlopez@walmart.cl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_telefono">Telefono Contacto</Label>
                  <Input 
                    id="contacto_telefono" 
                    name="contacto_telefono" 
                    type="tel"
                    placeholder="+56 9 8765 4321"
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
          <Link href="/admin/mandantes">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Mandante
          </Button>
        </div>
      </form>
    </div>
  )
}
