import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test 1: Simple count of approved conductor docs
    const { count: conductorCount, error: e1 } = await supabase
      .from("uploaded_documents")
      .select("*", { count: 'exact', head: true })
      .in('validation_status', ['approved', 'aprobado'])
    
    // Test 2: Simple count of approved sub docs
    const { count: subCount, error: e2 } = await supabase
      .from("subcontractor_documents")
      .select("*", { count: 'exact', head: true })
      .in('status', ['approved', 'aprobado'])
    
    // Test 3: Get first 5 conductor docs with full data
    const { data: conductorSample, error: e3 } = await supabase
      .from("uploaded_documents")
      .select(`
        id,
        original_filename,
        validation_status,
        created_at,
        updated_at
      `)
      .in('validation_status', ['approved', 'aprobado'])
      .order("updated_at", { ascending: false })
      .limit(5)
    
    // Test 4: Get first 5 sub docs with full data
    const { data: subSample, error: e4 } = await supabase
      .from("subcontractor_documents")
      .select(`
        id,
        document_name,
        status,
        created_at,
        updated_at
      `)
      .in('status', ['approved', 'aprobado'])
      .order("updated_at", { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        conductorApproved: conductorCount,
        subApproved: subCount,
        total: (conductorCount || 0) + (subCount || 0)
      },
      errors: {
        conductorCount: e1?.message || null,
        subCount: e2?.message || null,
        conductorSample: e3?.message || null,
        subSample: e4?.message || null
      },
      samples: {
        conductor: conductorSample,
        sub: subSample
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
