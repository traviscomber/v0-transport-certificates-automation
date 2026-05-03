import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  try {
    // Create alerts table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title VARCHAR NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR NOT NULL CHECK (type IN ('warning', 'error', 'info', 'success')),
          category VARCHAR NOT NULL CHECK (category IN ('compliance', 'certificate', 'document', 'system')),
          status VARCHAR NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
          priority VARCHAR NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
          action_url VARCHAR,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `
    })

    // Create certificates table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS certificates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          certificate_type VARCHAR NOT NULL,
          file_name VARCHAR NOT NULL,
          file_url VARCHAR NOT NULL,
          expiry_date DATE,
          status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
          issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `
    })

    // Create reports table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          report_type VARCHAR NOT NULL CHECK (report_type IN ('compliance', 'certificates', 'activity', 'custom')),
          title VARCHAR NOT NULL,
          description TEXT,
          data JSONB,
          file_url VARCHAR,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `
    })

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully" 
    })
  } catch (error: any) {
    console.error("Database setup error:", error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
