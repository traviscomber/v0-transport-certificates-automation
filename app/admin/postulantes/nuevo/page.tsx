import { createClient } from "@/lib/supabase/server"
import { CreateApplicantForm } from "@/components/admin/create-applicant-form"

async function getCompanies() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("service_type", "TRANSPORTE")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching companies:", error)
    return []
  }

  return data || []
}

export default async function NuevoPostulantePage() {
  const companies = await getCompanies()

  return (
    <CreateApplicantForm 
      companies={companies.map(c => ({ id: c.id, razon_social: c.name }))} 
    />
  )
}
