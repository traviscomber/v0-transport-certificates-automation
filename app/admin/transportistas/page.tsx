import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Building2, Car, Users } from "lucide-react"
import Link from "next/link"

async function getTransportistas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("transportistas")
    .select(`
      *,
      vehiculos(count),
      conductores(count)
    `)
    .order("razon_social", { ascending: true })

  if (error) {
    console.error("Error fetching transportistas:", error)
    return []
  }

  return data || []
}

export default async function TransportistasPage() {
  const transportistas = await getTransportistas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transportistas</h1>
          <p className="text-muted-foreground">
            Gestiona las empresas de transporte registradas
          </p>
        </div>
        <Link href="/admin/transportistas/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Transportista
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
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

      {/* Transportistas List */}
      {transportistas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay transportistas registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza registrando tu primera empresa de transporte
            </p>
            <Link href="/admin/transportistas/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Transportista
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transportistas.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t.razon_social}</h3>
                      {t.nombre_fantasia && (
                        <p className="text-sm text-muted-foreground">{t.nombre_fantasia}</p>
                      )}
                      <p className="text-sm font-mono text-muted-foreground mt-1">
                        RUT: {t.rut}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Car className="h-4 w-4" />
                          {t.vehiculos?.[0]?.count || 0} vehiculos
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {t.conductores?.[0]?.count || 0} conductores
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      t.is_active 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {t.is_active ? "Activo" : "Inactivo"}
                    </span>
                    <Link href={`/admin/transportistas/${t.id}`}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
