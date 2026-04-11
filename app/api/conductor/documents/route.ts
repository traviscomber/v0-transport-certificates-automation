'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to find conductor_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get uploaded documents for this conductor
    const { data: documents, error: docsError } = await supabase
      .from('uploaded_documents')
      .select(`
        *,
        document_types:document_type_id(
          id,
          code,
          name,
          description,
          validity_days
        )
      `)
      .eq('conductor_id', profile.id)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Query error:', docsError)
      return NextResponse.json(
        { message: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    // Calculate days remaining for each document
    const documentsWithStatus = documents.map((doc) => {
      let daysRemaining = null
      let status = 'pending'

      if (doc.expiry_date) {
        const expiryDate = new Date(doc.expiry_date)
        const today = new Date()
        const diffTime = expiryDate.getTime() - today.getTime()
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (doc.validation_status === 'validated') {
          if (daysRemaining < 0) {
            status = 'expired'
          } else if (daysRemaining < 30) {
            status = 'expiring-soon'
          } else {
            status = 'valid'
          }
        }
      }

      return {
        ...doc,
        daysRemaining,
        status,
        documentType: doc.document_types?.[0],
      }
    })

    return NextResponse.json(
      {
        success: true,
        documents: documentsWithStatus,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
