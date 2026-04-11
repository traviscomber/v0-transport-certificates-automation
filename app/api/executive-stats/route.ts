import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET() {
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "executive") {
      return NextResponse.json(
        { error: "Only executives can access statistics" },
        { status: 403 }
      )
    }

    // Get queue statistics
    const { data: queueStats, error: queueError } = await supabase
      .from("document_queue")
      .select("queue_status", { count: "exact" })
      .eq("company_name", profile.company_name)

    let pendingCount = 0
    let inReviewCount = 0
    let completedCount = 0
    let rejectedCount = 0
    const totalQueue = queueStats?.length || 0

    queueStats?.forEach((item: any) => {
      if (item.queue_status === "pending") pendingCount++
      else if (item.queue_status === "in_review") inReviewCount++
      else if (item.queue_status === "completed") completedCount++
      else if (item.queue_status === "rejected") rejectedCount++
    })

    // Get review statistics
    const { data: reviewStats, error: reviewError } = await supabase
      .from("document_reviews")
      .select("status", { count: "exact" })
      .eq("company_name", profile.company_name)

    let approvedReviews = 0
    let rejectedReviews = 0
    let inProgressReviews = 0
    const totalReviews = reviewStats?.length || 0

    reviewStats?.forEach((item: any) => {
      if (item.status === "approved") approvedReviews++
      else if (item.status === "rejected") rejectedReviews++
      else if (item.status === "in_progress") inProgressReviews++
    })

    // Get recent documents
    const { data: recentDocs, error: docsError } = await supabase
      .from("documents")
      .select("id, file_name, upload_date, validation_status")
      .eq("company_name", profile.company_name)
      .order("upload_date", { ascending: false })
      .limit(10)

    // Calculate average review time (in hours)
    const { data: completedReviews } = await supabase
      .from("document_reviews")
      .select("created_at, reviewed_at")
      .eq("company_name", profile.company_name)
      .eq("status", "approved")
      .not("reviewed_at", "is", null)
      .limit(100)

    let avgReviewTime = 0
    if (completedReviews && completedReviews.length > 0) {
      const reviewTimes = completedReviews
        .map((review: any) => {
          const created = new Date(review.created_at).getTime()
          const reviewed = new Date(review.reviewed_at).getTime()
          return (reviewed - created) / (1000 * 60 * 60) // Convert to hours
        })
        .filter((time: number) => time > 0)

      if (reviewTimes.length > 0) {
        avgReviewTime = Math.round(
          reviewTimes.reduce((a: number, b: number) => a + b, 0) /
            reviewTimes.length
        )
      }
    }

    return NextResponse.json({
      success: true,
      statistics: {
        queue: {
          pending: pendingCount,
          inReview: inReviewCount,
          completed: completedCount,
          rejected: rejectedCount,
          total: totalQueue,
        },
        reviews: {
          approved: approvedReviews,
          rejected: rejectedReviews,
          inProgress: inProgressReviews,
          total: totalReviews,
        },
        performance: {
          averageReviewTimeHours: avgReviewTime,
          approvalRate:
            totalReviews > 0
              ? Math.round((approvedReviews / totalReviews) * 100)
              : 0,
        },
        recentDocuments: recentDocs || [],
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
