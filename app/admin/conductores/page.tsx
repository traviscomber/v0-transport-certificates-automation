import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Users, Building2, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"

async function getConductores() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conductores")
    .select(`
      *,
      transportistas(razon_social, rut)
    `)
    .order("apellido_paterno", { ascending: true })

  if (error) {
    console.error("Error fetching conductores:", error)
    return []
  }

  return data || []
}

function isLicenseExpiringSoon(date: string | null): boolean {
  if (!date) return false
  const expDate = new Date(date)
  const today = new Date()
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
}

function isLicenseExpired(date: string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export default async function ConductoresPage() {
  const conductores = await getConductores()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conductores</h1>
          <p className="text-muted-foreground">
            Gestiona los conductores registrados
          </p>
        </div>
        <Link href="/admin/conductores/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Conductor
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
                placeholder="Buscar por RUT o nombre..."
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Conductores List */}
      {conductores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay conductores registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Registra tu primer conductor
            </p>
            <Link href="/admin/conductores/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Conductor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conductores.map((c: any) => {
            const expired = isLicenseExpired(c.vencimiento_licencia)
            const expiringSoon = isLicenseExpiringSoon(c.vencimiento_licencia)
            
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {c.nombres} {c.apellido_paterno} {c.apellido_materno}
                        </h3>
                        <p className="text-sm font-mono text-muted-foreground">
                          RUT: {c.rut}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {c.transportistas?.razon_social || "Sin asignar"}
                          </span>
                          {c.clase_licencia && (
                            <span className="text-sm text-muted-foreground">
                              Licencia: {c.clase_licencia}
                            </span>
                          )}
                          {c.vencimiento_licencia && (
                            <span className={`flex items-center gap-1 text-sm ${
                              expired ? "text-red-600" : 
                              expiringSoon ? "text-yellow-600" : 
                              "text-muted-foreground"
                            }`}>
                              <Calendar className="h-4 w-4" />
                              Vence: {new Date(c.vencimiento_licencia).toLocaleDateString("es-CL")}
                              {expired && <AlertTriangle className="h-4 w-4 ml-1" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          Licencia Vencida
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Por Vencer
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        c.is_active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {c.is_active ? "Activo" : "Inactivo"}
                      </span>
                      <Link href={`/admin/conductores/${c.id}`}>
                        <Button variant="ghost" size="sm">Ver detalles</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
