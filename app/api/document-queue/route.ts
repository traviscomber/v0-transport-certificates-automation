import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role and company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "executive") {
      return NextResponse.json(
        { error: "Only executives can access document queue" },
        { status: 403 }
      )
    }

    // Get URL search parameters for filtering
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "pending"
    const priority = url.searchParams.get("priority")
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const offset = parseInt(url.searchParams.get("offset") || "0")

    let query = supabase
      .from("document_queue")
      .select(
        `
        id,
        document_id,
        company_name,
        priority,
        queue_status,
        assigned_to,
        created_at,
        assigned_at,
        completed_at,
        documents:document_id (
          id,
          file_name,
          file_size,
          upload_date,
          document_type,
          validation_status,
          profiles:uploader_id (
            full_name,
            email,
            role
          )
        )
      `,
        { count: "exact" }
      )
      .eq("company_name", profile.company_name)

    if (status) {
      query = query.eq("queue_status", status)
    }

    if (priority !== null) {
      query = query.eq("priority", parseInt(priority))
    }

    const { data: queue, error: queueError, count } = await query
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1)

    if (queueError) {
      console.error("[v0] Queue fetch error:", queueError)
      return NextResponse.json(
        { error: "Failed to fetch document queue", details: queueError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      queue: queue || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching queue:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
