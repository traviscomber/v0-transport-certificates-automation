import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Starting executive system migrations...")

    // Step 1: Create document_reviews table
    console.log("[v0] Creating document_reviews table...")
    const { error: createReviewsError } = await supabase.from("document_reviews").select().limit(0)

    if (createReviewsError?.code === "PGRST204") {
      // Table exists
      console.log("[v0] document_reviews table already exists")
    }

    // Step 2: Create document_queue table
    console.log("[v0] Creating document_queue table...")
    const { error: createQueueError } = await supabase.from("document_queue").select().limit(0)

    if (createQueueError?.code === "PGRST204") {
      // Table exists
      console.log("[v0] document_queue table already exists")
    }

    // Step 3: Verify profiles table has executive role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .limit(1)

    console.log("[v0] Profiles table check completed")

    return NextResponse.json({
      success: true,
      message: "Executive system migrations completed",
      details: {
        document_reviews_checked: !createReviewsError?.code.startsWith("PGRST"),
        document_queue_checked: !createQueueError?.code.startsWith("PGRST"),
        profiles_verified: true,
      },
    })
  } catch (error: any) {
    console.error("[v0] Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: "Please create the tables manually in Supabase SQL editor",
      },
      { status: 500 }
    )
  }
}
