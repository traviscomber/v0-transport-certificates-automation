import { getUserPrimaryRole, userHasRole } from '@/lib/supabase/user-roles-service'
import { UserRole } from '@/lib/rbac-access-control'

export interface RoleContext {
  userId: string
  role: UserRole | null
  permissions: string[]
  canAccess: (route: string) => boolean
}

/**
 * Get role context for authenticated user
 */
export async function getRoleContext(userId: string): Promise<RoleContext> {
  const role = await getUserPrimaryRole(userId)
  
  // Import permissions after getting role to avoid circular deps
  const { ROLE_PERMISSIONS } = await import('@/lib/rbac-access-control')
  
  const permissions = role ? Object.keys(ROLE_PERMISSIONS[role] || {}) : []
  
  return {
    userId,
    role,
    permissions,
    canAccess: (route: string) => {
      if (!role) return false
      const routePermissions = ROLE_PERMISSIONS[role]
      return Object.values(routePermissions).some((perms: any) => 
        perms.read || perms.write
      )
    },
  }
}

/**
 * Check if user can access resource
 */
export async function checkAccess(
  userId: string,
  resource: string,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  const role = await getUserPrimaryRole(userId)
  if (!role) return false
  
  const { ROLE_PERMISSIONS } = await import('@/lib/rbac-access-control')
  const perms = ROLE_PERMISSIONS[role]
  
  // Check if role has permission for this resource
  return Object.entries(perms).some(([key, val]: any) => 
    key.includes(resource) && val[action]
  )
}

/**
 * Require authentication and role
 */
export async function requireRole(
  userId: string | undefined,
  requiredRole: UserRole
): Promise<boolean> {
  if (!userId) return false
  return userHasRole(userId, requiredRole)
}
