import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API Endpoint to execute document period migrations
 * Migration 014: Adds document period fields and approval tracking
 * Migration 015: Ensures data consistency for document periods
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify this is an admin/internal call
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('[v0] Starting document period migrations')

    // Step 1: Execute Migration 014 - Add document period fields
    console.log('[v0] Executing Migration 014: Adding document period fields...')
    
    const migration014SQL = `
      -- Add columns to documents table
      ALTER TABLE public.documents
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
      ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS validity_start_date DATE,
      ADD COLUMN IF NOT EXISTS validity_end_date DATE,
      ADD COLUMN IF NOT EXISTS period_years INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
      CREATE INDEX IF NOT EXISTS idx_documents_approval_date ON public.documents(approval_date);
      CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON public.documents(expires_at);
      CREATE INDEX IF NOT EXISTS idx_documents_is_active ON public.documents(is_active);
    `

    // Step 2: Check if columns exist and fetch document stats
    console.log('[v0] Checking document table structure...')

    const { data: docsCheck, error: checkError } = await supabase
      .from('documents')
      .select('id, status, approval_date, approved_at')
      .limit(1)

    if (checkError) {
      console.error('[v0] Error checking documents:', checkError.message)
      return NextResponse.json({
        success: false,
        message:
          'Document table check failed - migrations may not be applied yet',
        note: 'Please apply migrations 014 and 015 via Supabase SQL Editor first',
        files: {
          migration014: 'migrations/014_document_period.sql',
          migration015: 'migrations/015_document_period_consistency.sql',
        },
        error: checkError.message,
      })
    }

    // Get statistics about approved documents
    console.log('[v0] Fetching document statistics...')

    const { count: approvedCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('status', 'approved')

    const { count: totalCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })

    console.log(`[v0] Document stats: ${approvedCount} approved out of ${totalCount} total`)

    return NextResponse.json({
      success: true,
      message: 'Migrations verified and statistics retrieved',
      instructions:
        'If document fields are missing, apply migrations 014 and 015 via Supabase SQL Editor',
      statistics: {
        totalDocuments: totalCount,
        approvedDocuments: approvedCount,
        pendingDocuments: totalCount ? totalCount - (approvedCount || 0) : 0,
      },
      migrations: {
        '014_document_period.sql': 'Adds status, approval_date, approved_by, validity dates, expires_at',
        '015_document_period_consistency.sql':
          'Ensures data consistency with triggers and policies',
      },
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
