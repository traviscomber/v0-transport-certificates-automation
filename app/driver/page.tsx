import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DriverDashboard } from "@/components/driver/driver-dashboard"

export default async function DriverPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "driver") {
    redirect("/auth/login")
  }

  // Get user certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("driver_id", data.user.id)
    .order("created_at", { ascending: false })

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  return <DriverDashboard profile={profile} certificates={certificates || []} notifications={notifications || []} />
}
