import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { HelpBox } from "@/components/ui/help-box"
import { ApplicantsListClient } from "@/components/admin/applicants-list-client"

async function getApplicants() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("applicants")
    .select(`
      id,
      first_name,
      last_name,
      email,
      rut,
      license_type,
      status,
      background_check_status,
      created_at,
      company_id
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching applicants:", error)
    return []
  }

  return (data || []).map((app: any) => ({
    id: app.id,
    firstName: app.first_name,
    lastName: app.last_name,
    email: app.email,
    rut: app.rut,
    licenseType: app.license_type,
    status: app.status,
    backgroundCheckStatus: app.background_check_status,
    createdAt: app.created_at,
    companyName: "Sin asignar",
  }))
}

export default async function PostulantesPage() {
  const applicants = await getApplicants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Postulantes</h1>
          <p className="text-muted-foreground">
            Gestión de candidatos: registro, chequeo de antecedentes, documentación y aprobación
          </p>
        </div>
        <Link href="/admin/postulantes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Postulante
          </Button>
        </Link>
      </div>

      {/* Help Box */}
      <HelpBox
        variant="info"
        title="Flujo de Onboarding de Postulantes"
        description="Sistema centralizado para gestionar candidatos desde registro hasta aprobación final como conductor operacional."
        tips={[
          "NUEVO: Postulante llena formulario inicial con datos básicos",
          "CHEQUEO: Sistema verifica antecedentes en sitio externo",
          "DOCUMENTOS: Postulante sube licencia, certificaciones, etc",
          "APROBACIÓN: Equipo de Onboarding/Prevención de Riesgos aprueba",
          "FINAL: Conductor registrado en sistema operacional"
        ]}
      />

      {/* Applicants List */}
      <ApplicantsListClient applicants={applicants} />
    </div>
  )
}
