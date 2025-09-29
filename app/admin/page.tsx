import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Get all certificates with user info
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      profiles!certificates_driver_id_fkey (
        full_name,
        email,
        company_name
      )
    `)
    .order("created_at", { ascending: false })

  // Get system statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCertificates } = await supabase.from("certificates").select("*", { count: "exact", head: true })

  const { count: pendingCertificates } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: expiredCertificates } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("status", "expired")

  // Get recent activity (audit log)
  const { data: auditLog } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      profiles!notifications_user_id_fkey (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <AdminDashboard
      profile={profile}
      users={users || []}
      certificates={certificates || []}
      auditLog={auditLog || []}
      notifications={notifications || []}
      stats={{
        totalUsers: totalUsers || 0,
        totalCertificates: totalCertificates || 0,
        pendingCertificates: pendingCertificates || 0,
        expiredCertificates: expiredCertificates || 0,
      }}
    />
  )
}
