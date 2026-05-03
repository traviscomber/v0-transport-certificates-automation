export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Building2, Truck, Mail, Phone } from "lucide-react"
import Link from "next/link"

async function getMandantes() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("mandantes")
    .select(`
      *,
      mandante_transportista(count)
    `)
    .order("razon_social", { ascending: true })

  if (error) {
    console.error("Error fetching mandantes:", error)
    return []
  }

  return data || []
}

export default async function MandantesPage() {
  const mandantes = await getMandantes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mandantes</h1>
          <p className="text-muted-foreground">
            Empresas que contratan servicios de transporte
          </p>
        </div>
        <Link href="/admin/mandantes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Mandante
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por RUT o razon social..."
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mandantes List */}
      {mandantes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay mandantes registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Registra tu primer mandante (cliente que contrata transporte)
            </p>
            <Link href="/admin/mandantes/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Mandante
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mandantes.map((m: any) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    m.is_active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {m.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">
                  {m.nombre_fantasia || m.razon_social}
                </h3>
                <p className="text-sm font-mono text-muted-foreground mb-3">
                  RUT: {m.rut}
                </p>
                
                <div className="space-y-2 text-sm">
                  {m.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                  {m.telefono && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{m.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{m.mandante_transportista?.[0]?.count || 0} transportistas asociados</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Link href={`/admin/mandantes/${m.id}`}>
                    <Button variant="ghost" size="sm">Ver detalles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
