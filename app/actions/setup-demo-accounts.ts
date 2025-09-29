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
      const { data: existingUsers } = await adminClient.auth.admin.listUsers()
      const existingUser = existingUsers.users?.find((user) => user.email === account.email)

      let userId: string = account.userId

      if (existingUser) {
        console.log(`User ${account.email} already exists, using existing user`)
        userId = existingUser.id
      } else {
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true, // Skip email confirmation for demo accounts
          user_id: account.userId, // Use deterministic UUID
        })

        if (authError) {
          console.error(`Error creating auth user for ${account.email}:`, authError)
          results.push({ email: account.email, success: false, error: authError.message })
          continue
        }

        if (!authData.user) {
          results.push({ email: account.email, success: false, error: "No user data returned" })
          continue
        }

        userId = authData.user.id
      }

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

      // The SQL script already created comprehensive sample data

      results.push({ email: account.email, success: true, userId, existed: !!existingUser })
    }

    return { success: true, results }
  } catch (error: any) {
    console.error("Error setting up demo accounts:", error)
    return { success: false, error: error.message }
  }
}
