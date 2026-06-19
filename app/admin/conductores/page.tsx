export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { HelpBox } from "@/components/ui/help-box"
import { ConductoresListClient } from "@/components/admin/conductores-list-client"

async function getConductores() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conductores")
    .select(`
      *,
      transportistas(razon_social, rut),
      conductor_vehiculo(id, vehiculo_id, es_principal)
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

      {/* Ayuda Educativa - Onboarding */}
      <HelpBox
        variant="info"
        title="Gestión Integral de Conductores"
        description="Sistema centralizado para gestionar conductores, licencias profesionales (A2/A5), certificaciones de seguridad, vehículos asignados y estado operativo."
        tips={[
          "Usa los filtros para encontrar conductores por empresa, RUT proveedor, licencia, vehículo o estado operativo.",
          "ROJO 'Licencia Vencida' = conductor NO puede operar hasta renovar su licencia inmediatamente.",
          "AMARILLO 'Por Vencer' = licencia vence pronto y requiere renovación próxima.",
          "VERDE 'Licencia Activa' = conductor habilitado para operar con licencia vigente.",
          "Los períodos permiten analizar historial operativo, licencias y cumplimiento en los últimos 4 meses.",
          "Verifica certificaciones profesionales (ADR, Defensivo, Seguridad) en la sección de detalles de cada conductor."
        ]}
      />

      {/* Conductores List with Client-Side Filtering */}
      <ConductoresListClient 
        conductores={conductores}
        companies={companies.map(c => ({ id: c.id, razon_social: c.razon_social, rut: c.rut }))} 
      />

    </div>
  )
}
