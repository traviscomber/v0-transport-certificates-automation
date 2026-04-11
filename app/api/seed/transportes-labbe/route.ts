import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // 1. Insert Transportes Labbe company
    const { data: transportista, error: transportistaError } = await supabase
      .from("transportistas")
      .upsert(
        {
          rut_empresa: "76.123.456-7",
          nombre_empresa: "TRANSPORTES LABBE",
          representante: "Olga Lydia Carrasco Olivares",
          email: "info@transporteslabbe.cl",
          telefono: "+56977764753",
          direccion: "Santiago, Región Metropolitana, Chile",
        },
        { onConflict: "rut_empresa" }
      )
      .select()
      .single()

    if (transportistaError) {
      console.error("Error inserting transportista:", transportistaError)
      return NextResponse.json(
        { error: "Failed to insert transportista", details: transportistaError },
        { status: 400 }
      )
    }

    // 2. Insert executives
    const executives = [
      {
        transportista_id: transportista.id,
        full_name: "Olga Lydia Carrasco Olivares",
        rut: "10574005-0",
        email_auth: "olga.carrasco@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56977764753",
        cargo: "Ejecutiva",
        login_enabled: true,
      },
      {
        transportista_id: transportista.id,
        full_name: "Carolina Pilar Sepulveda Contreras",
        rut: "15464094-0",
        email_auth: "carolina.sepulveda@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56950067666",
        cargo: "Ejecutiva",
        login_enabled: true,
      },
      {
        transportista_id: transportista.id,
        full_name: "Daniela Constanza Silva Rojas",
        rut: "17768246-2",
        email_auth: "daniela.silva@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56978540722",
        cargo: "Ejecutiva",
        login_enabled: true,
      },
      {
        transportista_id: transportista.id,
        full_name: "Cecilia Del Carmen Farias Muñoz",
        rut: "9888992-2",
        email_auth: "cecilia.farias@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56978540798",
        cargo: "Ejecutiva",
        login_enabled: true,
      },
      {
        transportista_id: transportista.id,
        full_name: "Diego Andres Gonzalez Valenzuela",
        rut: "20114106-0",
        email_auth: "diego.gonzalez@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56978455527",
        cargo: "Jefe RRHH",
        login_enabled: true,
      },
      {
        transportista_id: transportista.id,
        full_name: "Katherinne Johanna Canales Hernandez",
        rut: "18717311-6",
        email_auth: "katherinne.canales@transporteslabbe.cl",
        password_hash: "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJK",
        phone: "+56956139744",
        cargo: "Asistente RRHH",
        login_enabled: true,
      },
    ]

    const { data: executivesData, error: executivesError } = await supabase
      .from("executive_staff")
      .upsert(executives, { onConflict: "rut" })
      .select()

    if (executivesError) {
      console.error("Error inserting executives:", executivesError)
      return NextResponse.json(
        { error: "Failed to insert executives", details: executivesError },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transportes Labbe data loaded successfully",
        transportista: transportista,
        executives_loaded: executivesData?.length || 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error loading Transportes Labbe data:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
