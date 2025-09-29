import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DispatcherDashboard } from "@/components/dispatcher/dispatcher-dashboard"

export default async function DispatcherPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "dispatcher") {
    redirect("/auth/login")
  }

  // Get company drivers
  const { data: drivers } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_name", profile.company_name)
    .eq("role", "driver")
    .order("full_name")

  // Get company certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      profiles!certificates_driver_id_fkey (
        full_name,
        email
      )
    `)
    .in("driver_id", drivers?.map((d) => d.id) || [])
    .order("created_at", { ascending: false })

  // Get pending certificates count
  const { count: pendingCount } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .in("driver_id", drivers?.map((d) => d.id) || [])
    .eq("status", "pending")

  // Get expiring certificates (next 30 days)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data: expiringCertificates } = await supabase
    .from("certificates")
    .select(`
      *,
      profiles!certificates_driver_id_fkey (
        full_name,
        email
      )
    `)
    .in("driver_id", drivers?.map((d) => d.id) || [])
    .eq("status", "approved")
    .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
    .gte("expiry_date", new Date().toISOString().split("T")[0])

  return (
    <DispatcherDashboard
      profile={profile}
      drivers={drivers || []}
      certificates={certificates || []}
      pendingCount={pendingCount || 0}
      expiringCertificates={expiringCertificates || []}
    />
  )
}
