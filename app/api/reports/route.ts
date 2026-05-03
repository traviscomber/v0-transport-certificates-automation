import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET all reports for the user
export async function GET(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('generated_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: reports })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new report
export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { report_type, title, description, data, file_url } = body

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        generated_by: user.id,
        report_type,
        title,
        description,
        data,
        file_url
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: report }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
