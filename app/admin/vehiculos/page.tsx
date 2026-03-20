import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Car, Building2, Calendar, Gauge } from "lucide-react"
import Link from "next/link"

async function getVehiculos() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      transportistas(razon_social, rut)
    `)
    .order("patente", { ascending: true })

  if (error) {
    console.error("Error fetching vehiculos:", error)
    return []
  }

  return data || []
}

export default async function VehiculosPage() {
  const vehiculos = await getVehiculos()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehiculos</h1>
          <p className="text-muted-foreground">
            Gestiona la flota de vehiculos registrados
          </p>
        </div>
        <Link href="/admin/vehiculos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Vehiculo
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
                placeholder="Buscar por patente..."
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehiculos List */}
      {vehiculos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay vehiculos registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Agrega tu primer vehiculo a la flota
            </p>
            <Link href="/admin/vehiculos/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Vehiculo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehiculos.map((v: any) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <Car className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    v.is_active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {v.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                <h3 className="font-bold text-xl font-mono mb-1">{v.patente}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {v.marca} {v.modelo} {v.ano && `(${v.ano})`}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{v.transportistas?.razon_social || "Sin asignar"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <span>{v.tipo}</span>
                  </div>
                  {v.capacidad_carga && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Carga: {v.capacidad_carga} {v.unidad_carga}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className={`text-xs ${v.tiene_gps ? "text-green-600" : "text-muted-foreground"}`}>
                    {v.tiene_gps ? "GPS Activo" : "Sin GPS"}
                  </span>
                  <Link href={`/admin/vehiculos/${v.id}`}>
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
