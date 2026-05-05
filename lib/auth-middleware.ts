import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'mandante' | 'transportista'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  organization_id?: string
}

// Middleware para verificar autenticación
export async function verifyAuth(request: NextRequest): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    console.log('[v0] verifyAuth: Attempting to verify authentication')
    
    const supabase = await createClient()
    
    // Try Supabase Auth first
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()
    
    if (supabaseUser) {
      console.log('[v0] verifyAuth: Using Supabase Auth user:', supabaseUser.id)
      
      // Get user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', supabaseUser.id)
        .maybeSingle()

      if (profileError) {
        return { user: null, error: 'Failed to fetch user profile' }
      }

      if (!profile) {
        return { user: null, error: 'User profile not yet initialized' }
      }

      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: profile.role as UserRole,
          organization_id: profile.organization_id,
        }
      }
    }
    
    // Fallback to simple cookie-based authentication
    console.log('[v0] verifyAuth: Supabase Auth failed, trying simple login cookies')
    
    const userEmail = request.cookies.get('user_email')?.value
    const userName = request.cookies.get('user_name')?.value
    const userRole = request.cookies.get('user_role')?.value
    const userOrgId = request.cookies.get('user_organization_id')?.value
    
    console.log('[v0] verifyAuth: Cookie values:', { 
      email: userEmail, 
      name: userName, 
      role: userRole, 
      org_id: userOrgId 
    })

    if (!userEmail || !userRole) {
      console.log('[v0] verifyAuth: Missing required cookies (email or role)')
      return { user: null, error: 'Unauthorized' }
    }

    // For simple login, we need to get user ID from profiles table by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, organization_id')
      .eq('email', userEmail)
      .maybeSingle()

    if (profileError) {
      console.log('[v0] verifyAuth: Profile lookup error:', profileError.message)
      return { user: null, error: 'Failed to fetch user profile' }
    }

    if (!profile) {
      console.log('[v0] verifyAuth: No profile found for email:', userEmail)
      return { user: null, error: 'User profile not found' }
    }

    console.log('[v0] verifyAuth: Simple login successful for:', userEmail, 'with org_id:', profile.organization_id)

    return {
      user: {
        id: profile.id,
        email: userEmail,
        role: (userRole || profile.role) as UserRole,
        organization_id: userOrgId || profile.organization_id,
      }
    }
  } catch (error) {
    console.error('[v0] verifyAuth EXCEPTION:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

// Middleware para verificar permisos por rol
export function checkRolePermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

// Middleware para verificar acceso a organización
export function checkOrganizationAccess(userOrgId: string | undefined, targetOrgId: string | undefined): boolean {
  // Admin puede acceder a cualquier organización
  if (!userOrgId) return true
  
  // Otros roles solo pueden acceder su propia organización
  return userOrgId === targetOrgId
}

// Wrapper para proteger endpoints
export async function protectedEndpoint(
  request: NextRequest,
  handler: (user: AuthUser, request: NextRequest) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
): Promise<NextResponse> {
  try {
    const { user, error: authError } = await verifyAuth(request)

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Check role permission if specified
    if (allowedRoles && !checkRolePermission(user.role, allowedRoles)) {
      return NextResponse.json(
        { error: `Forbidden: ${user.role} role not allowed`, success: false },
        { status: 403 }
      )
    }

    // Call the handler with authenticated user
    return await handler(user, request)
  } catch (error) {
    console.error('Protected endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

// Middleware para logging de auditoría
export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: Record<string, any>
) {
  try {
    const supabase = await createClient()
    
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      details: details || {},
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

// Response helper para estandarizar respuestas
export function successResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Operation successful'
    },
    { status }
  )
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  )
}
