"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const DEMO_USER_IDS = {
  "conductor@demo.cl": "11111111-1111-1111-1111-111111111111",
  "despachador@demo.cl": "22222222-2222-2222-2222-222222222222",
  "admin@demo.cl": "33333333-3333-3333-3333-333333333333",
}

export async function setupDemoAccounts() {
  try {
    const adminClient = createAdminClient()

    const demoAccounts = [
      {
        email: "conductor@demo.cl",
        password: "demo123",
        userId: DEMO_USER_IDS["conductor@demo.cl"],
        profile: {
          full_name: "Juan Carlos Pérez",
          role: "driver",
          rut: "12.345.678-9",
          phone: "+56 9 8765 4321",
          company_name: "Transportes Demo Ltda.",
          address: "Av. Los Transportistas 123",
          city: "Santiago",
          region: "Metropolitana",
        },
      },
      {
        email: "despachador@demo.cl",
        password: "demo123",
        userId: DEMO_USER_IDS["despachador@demo.cl"],
        profile: {
          full_name: "María Elena González",
          role: "dispatcher",
          rut: "98.765.432-1",
          phone: "+56 9 1234 5678",
          company_name: "Central de Despacho Demo",
          address: "Av. Logística 456",
          city: "Valparaíso",
          region: "Valparaíso",
        },
      },
      {
        email: "admin@demo.cl",
        password: "demo123",
        userId: DEMO_USER_IDS["admin@demo.cl"],
        profile: {
          full_name: "Roberto Silva Administrador",
          role: "admin",
          rut: "11.222.333-4",
          phone: "+56 9 9999 0000",
          company_name: "Sistema Central Demo",
          address: "Av. Administración 789",
          city: "Santiago",
          region: "Metropolitana",
        },
      },
    ]

    const results = []

    for (const account of demoAccounts) {
      try {
        // Try to create the user directly - if it already exists, it will error but we can handle it
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true, // Skip email confirmation for demo accounts
          user_id: account.userId, // Use deterministic UUID
        })

        if (authError) {
          // User might already exist - that's okay, use the ID from account
          console.log(`Auth user creation result for ${account.email}:`, authError.message)
          
          // For existing users, we'll just use the predefined ID
          // If it's a different error, we'll still continue and try to create the profile
        }

        const userId = authData?.user?.id || account.userId

        const { error: profileError } = await adminClient.from("profiles").upsert(
          {
            id: userId,
            email: account.email,
            ...account.profile,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (profileError) {
          console.error(`Error upserting profile for ${account.email}:`, profileError)
          results.push({ email: account.email, success: false, error: profileError.message })
          continue
        }

        results.push({ email: account.email, success: true, userId })
      } catch (error: any) {
        console.error(`Unexpected error for ${account.email}:`, error)
        results.push({ email: account.email, success: false, error: error.message })
      }
    }

    return { success: true, results }
  } catch (error: any) {
    console.error("Error setting up demo accounts:", error)
    return { success: false, error: error.message }
  }
}
