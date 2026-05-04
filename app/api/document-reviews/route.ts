import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, status, comments, rejectionReason, priority } = body

    if (!documentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, status" },
        { status: 400 }
      )
    }

    if (!["approved", "rejected", "in_progress"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: approved, rejected, or in_progress" },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to verify executive role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "executive") {
      return NextResponse.json(
        { error: "Only executives can submit reviews" },
        { status: 403 }
      )
    }

    // Verify document belongs to their company
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("id, company_name")
      .eq("id", documentId)
      .single()

    if (docError || !document || document.company_name !== profile.company_name) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      )
    }

    // Create or update review record
    const { data: review, error: reviewError } = await supabase
      .from("document_reviews")
      .upsert(
        {
          document_id: documentId,
          reviewer_id: user.id,
          company_name: profile.company_name,
          status,
          comments: comments || null,
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
        },
        { onConflict: "document_id,reviewer_id" }
      )
      .select()
      .single()

    if (reviewError) {
      console.error("[v0] Review creation error:", reviewError)
      return NextResponse.json(
        { error: "Failed to create review", details: reviewError },
        { status: 500 }
      )
    }

    // Update queue status
    const queueStatus =
      status === "approved"
        ? "completed"
        : status === "rejected"
          ? "rejected"
          : "in_review"

    const { error: queueError } = await supabase
      .from("document_queue")
      .update({
        queue_status: queueStatus,
        assigned_to: user.id,
        assigned_at: new Date().toISOString(),
        completed_at: ["completed", "rejected"].includes(queueStatus)
          ? new Date().toISOString()
          : null,
      })
      .eq("document_id", documentId)

    if (queueError) {
      console.warn("[v0] Queue update warning:", queueError)
      // Don't fail the whole operation if queue update fails
    }

    // Update document validation status
    const { error: docUpdateError } = await supabase
      .from("documents")
      .update({
        validation_status: status === "approved" ? "approved" : "rejected",
      })
      .eq("id", documentId)

    if (docUpdateError) {
      console.warn("[v0] Document update warning:", docUpdateError)
    }

    return NextResponse.json({
      success: true,
      review,
      message: `Document review submitted with status: ${status}`,
    })
  } catch (error: any) {
    console.error("[v0] Error submitting review:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const documentId = url.searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId parameter" },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get reviews for this document
    const { data: reviews, error: reviewError } = await supabase
      .from("document_reviews")
      .select(
        `
        *,
        profiles:reviewer_id (
          full_name,
          email
        )
      `
      )
      .eq("document_id", documentId)

    if (reviewError) {
      return NextResponse.json(
        { error: "Failed to fetch reviews", details: reviewError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    })
  } catch (error: any) {
    console.error("[v0] Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
