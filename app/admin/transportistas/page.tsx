export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Building2, Car, Users, HelpCircle, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"

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
            Lista de empresas de transporte registradas en el sistema
          </p>
        </div>
        <Link href="/admin/transportistas/nuevo" title="Haz clic para agregar una nueva empresa">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Transportista
          </Button>
        </Link>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="info"
        title="Que es un transportista?"
        description="Un transportista es una empresa de transporte que presta servicios de carga. Aqui puedes ver todas las empresas registradas y administrarlas."
        tips={[
          "Haz clic en el boton azul 'Nuevo Transportista' para registrar una nueva empresa.",
          "Cada tarjeta muestra el nombre de la empresa, su RUT, y cuantos vehiculos y conductores tiene.",
          "El estado 'Activo' en verde significa que la empresa puede operar. 'Inactivo' en rojo significa que esta suspendida.",
          "Haz clic en los tres puntos (...) de cada tarjeta para ver mas opciones."
        ]}
      />

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <QuickHelp text="Escribe el RUT o el nombre de la empresa en el cuadro de busqueda para encontrarla rapidamente." />
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Escribe aqui para buscar por RUT o nombre..."
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline" title="Haz clic para ver opciones de filtrado">Filtros</Button>
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
        <Card>
          <CardHeader>
            <CardTitle>Lista de Transportistas</CardTitle>
            <CardDescription>
              Total: {transportistas.length} transportistas registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">RUT</th>
                    <th className="text-left py-3 px-4 font-semibold">Razón Social</th>
                    <th className="text-left py-3 px-4 font-semibold">Representante Legal</th>
                    <th className="text-left py-3 px-4 font-semibold">Ejecutivo</th>
                    <th className="text-left py-3 px-4 font-semibold">Teléfono</th>
                    <th className="text-left py-3 px-4 font-semibold">Correo</th>
                    <th className="text-left py-3 px-4 font-semibold">Comuna</th>
                    <th className="text-center py-3 px-4 font-semibold">Certificaciones</th>
                    <th className="text-center py-3 px-4 font-semibold">Estado</th>
                    <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transportistas.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{t.rut}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{t.razon_social}</p>
                          {t.nombre_fantasia && (
                            <p className="text-xs text-muted-foreground">{t.nombre_fantasia}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{t.representante_legal || "-"}</td>
                      <td className="py-3 px-4 text-sm">{t.ejecutivo_nombre || "-"}</td>
                      <td className="py-3 px-4 text-sm">{t.telefono || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        {t.correo ? (
                          <a href={`mailto:${t.correo}`} className="text-blue-600 hover:underline">
                            {t.correo}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{t.comuna || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          {t.ariztia && <span title="Ariztia" className="text-green-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.lts && <span title="LTS" className="text-blue-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.rendic && <span title="Rendic" className="text-purple-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {t.interpolar && <span title="Interpolar" className="text-orange-600"><CheckCircle2 className="h-4 w-4" /></span>}
                          {!t.ariztia && !t.lts && !t.rendic && !t.interpolar && (
                            <span className="text-muted-foreground text-xs">Ninguna</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.is_active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {t.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/admin/transportistas/${t.id}`}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
