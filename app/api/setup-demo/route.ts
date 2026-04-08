import { setupDemoAccounts } from "@/app/actions/setup-demo-accounts"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await setupDemoAccounts()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Setup demo error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error al crear cuentas demo" },
      { status: 500 }
    )
  }
}
