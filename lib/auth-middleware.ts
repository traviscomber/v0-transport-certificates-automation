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
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { user: null, error: 'Unauthorized' }
    }

    // Get user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { user: null, error: 'User profile not found' }
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        role: profile.role as UserRole,
        organization_id: profile.organization_id,
      }
    }
  } catch (error) {
    console.error('Auth verification error:', error)
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
