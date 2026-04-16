import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Building2, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"
import { HelpBox, QuickHelp } from "@/components/ui/help-box"
import { DriverFilters, type DriverFilters as DriverFiltersType } from "@/components/admin/driver-filters"
import { LicenseAndCertifications } from "@/components/admin/license-certifications"

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

async function getCompanies() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("transportistas")
    .select("id, razon_social, rut")
    .order("razon_social", { ascending: true })

  if (error) {
    console.error("Error fetching companies:", error)
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
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conductores</h1>
          <p className="text-muted-foreground">
            Gestión de conductores, licencias, certificaciones y estado operativo
          </p>
        </div>
        <Link href="/admin/conductores/nuevo" title="Haz clic para registrar un nuevo conductor">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Conductor
          </Button>
        </Link>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="info"
        title="Gestión Operativa de Conductores"
        description="Sistema centralizado para gestionar conductores, licencias (A2/A5), certificaciones profesionales, subcontratistas y estado de liquidaciones."
        tips={[
          "Usa los filtros para encontrar conductores por empresa, RUT proveedor, tipo de vehículo y estado de licencia.",
          "ROJO 'Licencia Vencida' = conductor NO puede operar hasta renovar licencia.",
          "AMARILLO 'Por Vencer' = licencia vence en menos de 30 días.",
          "VERDE 'Activo' = conductor habilitado para trabajar.",
          "Verifica certificaciones profesionales (ADR, Defensivo, Seguridad)."
        ]}
      />

      {/* Filtros Avanzados */}
      <DriverFilters 
        companies={companies.map(c => ({ id: c.id, razon_social: c.razon_social, rut: c.rut }))} 
      />

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
                <CardContent className="p-6 space-y-4">
                  {/* Header Row */}
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
                            <span className="text-sm text-muted-foreground font-semibold">
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
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                          Licencia Vencida
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-semibold">
                          Por Vencer
                        </span>
                      )}
                      {!expired && !expiringSoon && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-semibold">
                          Licencia Activa
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.is_active 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {c.is_active ? "En Servicio" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* License and Certifications Info */}
                  <div className="pt-4 border-t">
                    <LicenseAndCertifications 
                      licenses={c.vencimiento_licencia ? [{
                        id: c.id,
                        licenseType: c.clase_licencia || 'A2',
                        expiryDate: c.vencimiento_licencia,
                        status: expired ? 'expired' : (expiringSoon ? 'pending_renewal' : 'active'),
                      }] : []}
                      certifications={[]}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Link href={`/admin/conductores/${c.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link href={`/admin/conductores/${c.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
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
