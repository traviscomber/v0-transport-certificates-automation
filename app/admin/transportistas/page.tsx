export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { HelpBox } from "@/components/ui/help-box"
import { TransportistasClientWrapper } from "@/components/admin/transportistas-client-wrapper"

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
          <h1 className="text-3xl font-bold tracking-tight">Transportistas / Subcontratistas</h1>
          <p className="text-muted-foreground">
            Gestión de empresas de transporte, documentación, certificaciones y estado operativo
          </p>
        </div>
        <Link href="/admin/transportistas/nuevo" title="Haz clic para agregar una nueva empresa">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Transportista
          </Button>
        </Link>
      </div>

      {/* Ayuda Educativa - Onboarding */}
      <HelpBox
        variant="info"
        title="Gestión Integral de Transportistas y Subcontratistas"
        description="Sistema centralizado para gestionar empresas de transporte, documentación requerida, certificaciones, conductores y estado operativo de la flota."
        tips={[
          "Usa los filtros para encontrar transportistas por RUT, razón social, estado y período de análisis.",
          "VERDE 'Activo' = empresa habilitada para operar y transportar carga.",
          "ROJO 'Inactivo' = empresa suspendida o sin operaciones en el período.",
          "Verifica documentación requerida: licencias, certificaciones (Ariztia, LTS, Rendic, Interpolar), seguros y permisos vigentes.",
          "Los períodos permiten analizar historial de operaciones, documentación y cumplimiento en los últimos 4 meses.",
          "Haz clic en cada transportista para ver detalles completos, subcontratistas, conductores, vehículos y estado de documentos."
        ]}
      />

      {/* Transportistas List Client Component */}
      <TransportistasClientWrapper transportistas={transportistas} />
    </div>
  )
}
