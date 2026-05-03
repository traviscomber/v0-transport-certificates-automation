import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const DEMO_ACCOUNTS = [
  {
    email: "conductor@demo.cl",
    password: "demo123",
    full_name: "Juan Carlos Pérez",
    role: "driver",
    company_name: "Transportes Demo Ltda.",
  },
  {
    email: "despachador@demo.cl",
    password: "demo123",
    full_name: "María Elena González",
    role: "dispatcher",
    company_name: "Central de Despacho Demo",
  },
  {
    email: "admin@demo.cl",
    password: "demo123",
    full_name: "Roberto Silva",
    role: "admin",
    company_name: "DocuFleet",
  },
]

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing env vars — URL: ${!!url}, SERVICE_KEY: ${!!serviceKey}`,
      },
      { status: 500 }
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const results = []

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Try to create the user via Admin API
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          role: account.role,
          company_name: account.company_name,
        },
      })

      if (error && error.message !== "A user with this email address has already been registered") {
        results.push({ email: account.email, success: false, error: error.message })
        continue
      }

      const userId = data?.user?.id

      // Upsert profile if we got a userId (new user)
      if (userId) {
        await admin.from("profiles").upsert(
          {
            id: userId,
            email: account.email,
            full_name: account.full_name,
            role: account.role,
            company_name: account.company_name,
          },
          { onConflict: "id" }
        )
      }

      results.push({
        email: account.email,
        success: true,
        existed: !!error, // error = already existed
      })
    } catch (err: any) {
      results.push({ email: account.email, success: false, error: err.message })
    }
  }

  const allOk = results.every((r) => r.success)
  return NextResponse.json({ success: allOk, results })
}
