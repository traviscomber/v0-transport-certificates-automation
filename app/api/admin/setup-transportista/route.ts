import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    if (!rut || !password) {
      return NextResponse.json(
        { error: "RUT and password are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert into transportista_auth table
    const { data, error } = await supabase
      .from("transportista_auth")
      .upsert(
        {
          rut,
          password_hash: passwordHash,
          created_at: new Date().toISOString(),
        },
        { onConflict: "rut" }
      )
      .select()
      .single()

    if (error) {
      console.error("Error creating transportista auth:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create auth" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Transportista auth created/updated for RUT: ${rut}`,
      data,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
