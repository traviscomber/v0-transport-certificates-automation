"use server"

import { createClient } from "@supabase/supabase-js"

// Explicitly read env vars inside the function to avoid Server Action bundling issues
function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(`Missing Supabase env vars. URL: ${!!url}, KEY: ${!!key}`)
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

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
        let userId = account.userId
        let userExists = false

        // Try to create the user - if it already exists, that's OK
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_id: account.userId,
        })

        if (authError) {
          // If email already exists, that's OK - user was already created
          if (authError.code === "email_exists") {
            console.log(`User ${account.email} already exists - skipping auth creation`)
            userExists = true
            // Try to find the existing user's ID - but we'll use the predefined ID
            // since we created them with deterministic IDs
          } else {
            // Different error - report it
            console.error(`Auth error for ${account.email}:`, authError.message)
            results.push({ email: account.email, success: false, error: authError.message })
            continue
          }
        } else if (authData?.user?.id) {
          userId = authData.user.id
        }

        // Update or insert the profile - use a direct UPDATE query to avoid unique constraint issues
        if (userExists) {
          // If user exists, just do an update (not upsert which causes constraint issues)
          const { error: updateError } = await adminClient
            .from("profiles")
            .update({
              email: account.email,
              ...account.profile,
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          if (updateError) {
            console.error(`Error updating profile for ${account.email}:`, updateError)
            // If update fails, try insert as fallback
            const { error: insertError } = await adminClient.from("profiles").insert({
              id: userId,
              email: account.email,
              ...account.profile,
              is_active: true,
              updated_at: new Date().toISOString(),
            })

            if (insertError && !insertError.message.includes("duplicate")) {
              results.push({ email: account.email, success: false, error: insertError.message })
              continue
            }
          }
        } else {
          // New user - use upsert
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
            console.error(`Error creating profile for ${account.email}:`, profileError)
            results.push({ email: account.email, success: false, error: profileError.message })
            continue
          }
        }

        results.push({ email: account.email, success: true, userId, existed: userExists })
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
