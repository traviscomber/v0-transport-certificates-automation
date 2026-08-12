import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'ejecutiva'
  | 'prevencionista'
  | 'dispatcher'
  | 'driver'
  | 'conductor'
  | 'mandante'
  | 'transportista'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  organization_id?: string
}

/**
 * Super-admin domains - users from these domains have full CRUD access
 * to ALL data across all transportistas/companies.
 * Labbe is the mandante (principal company) that manages all subcontractors.
 */
const SUPER_ADMIN_DOMAINS = ['labbe.cl']

/**
 * Check if a user has super-admin privileges based on email domain or role.
 * Super-admins can manage ALL data across all companies.
 */
export function isSuperAdmin(email?: string | null, role?: UserRole | string | null): boolean {
  if (role === 'super_admin') return true
  if (!email) return false
  const domain = email.toLowerCase().split('@')[1]
  return SUPER_ADMIN_DOMAINS.includes(domain)
}

// Middleware para verificar autenticación
export async function verifyAuth(request: NextRequest): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    console.log('[v0] verifyAuth: START - Attempting to verify authentication')
    
    // For simple login, read cookies first
    const userEmail = request.cookies.get('user_email')?.value
    const userRole = request.cookies.get('user_role')?.value
    const userOrgId = request.cookies.get('user_organization_id')?.value
    
    console.log('[v0] verifyAuth: Cookie check:', { 
      hasEmail: !!userEmail,
      hasRole: !!userRole,
      hasOrgId: !!userOrgId,
      email: userEmail
    })

    // If simple login cookies exist, use them
    if (userEmail && userRole) {
      console.log('[v0] verifyAuth: Found simple login cookies for:', userEmail)
      
      // Legacy helper only. Privileged Stage 10 routes use requireServerActor()
      // and do not trust browser-written role cookies.
      const effectiveRole: UserRole = isSuperAdmin(userEmail, userRole)
        ? 'super_admin'
        : (userRole as UserRole)

      const authUser: AuthUser = {
        id: userEmail,
        email: userEmail,
        role: effectiveRole,
        organization_id: userOrgId,
      }

      console.log('[v0] verifyAuth: SUCCESS - Simple login user authenticated:', {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        is_super_admin: isSuperAdmin(authUser.email, authUser.role),
        org_id: authUser.organization_id
      })

      return { user: authUser }
    }

    console.log('[v0] verifyAuth: FAIL - No authentication cookies found')
    return { user: null, error: 'Unauthorized' }
  } catch (error) {
    console.error('[v0] verifyAuth EXCEPTION:', error instanceof Error ? error.message : String(error))
    return { user: null, error: 'Authentication failed' }
  }
}

export function checkRolePermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function checkOrganizationAccess(userOrgId: string | undefined, targetOrgId: string | undefined): boolean {
  if (!userOrgId) return true
  return userOrgId === targetOrgId
}

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

    if (allowedRoles && !checkRolePermission(user.role, allowedRoles)) {
      return NextResponse.json(
        { error: `Forbidden: ${user.role} role not allowed`, success: false },
        { status: 403 }
      )
    }

    return await handler(user, request)
  } catch (error) {
    console.error('Protected endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

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
