import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Obtener todos los perfiles de ejecutivos de Transportes Labbe
    const { data: executives, error } = await adminClient
      .from("profiles")
      .select("*")
      .eq("company_name", "Transportes Labbe")
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Obtener usuarios de autenticación para obtener emails
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    // Combinar información de profiles con datos de auth
    const executivesWithAuth = executives.map((exec) => {
      const authUser = authData.users.find((u) => u.id === exec.id)
      return {
        ...exec,
        email: authUser?.email || exec.email,
        created_at: exec.created_at,
      }
    })

    return NextResponse.json({
      success: true,
      total: executivesWithAuth.length,
      executives: executivesWithAuth,
    })
  } catch (error: any) {
    console.error("Error fetching executives:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
