import { createAdminClient } from '@/lib/supabase/admin'
import { UserRole } from '@/lib/rbac-access-control'

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  entity_id?: string
  entity_type?: string
  assigned_at: string
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  userId: string,
  role: UserRole,
  entityId?: string,
  entityType?: string
): Promise<UserRoleRecord> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role,
      entity_id: entityId,
      entity_type: entityType,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<UserRoleRecord[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

/**
 * Get primary role for user
 */
export async function getUserPrimaryRole(userId: string): Promise<UserRole | null> {
  const roles = await getUserRoles(userId)
  
  // Prioridad: administrador > despachador > mandante > transportista > conductor
  const rolePriority: Record<UserRole, number> = {
    administrador: 0,
    despachador: 1,
    mandante: 2,
    transportista: 3,
    conductor: 4,
  }
  
  if (roles.length === 0) return null
  
  return roles.reduce<UserRole>((primary, current) => {
    return rolePriority[current.role as UserRole] < rolePriority[primary]
      ? current.role as UserRole
      : primary
  }, roles[0].role as UserRole)
}

/**
 * Check if user has specific role
 */
export async function userHasRole(userId: string, role: UserRole): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.some(r => r.role === role)
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(userId: string, role: UserRole): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)

  if (error) throw error
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  oldRole: UserRole,
  newRole: UserRole
): Promise<void> {
  await removeRoleFromUser(userId, oldRole)
  await assignRoleToUser(userId, newRole)
}

/**
 * Get all users with specific role
 */
export async function getUsersByRole(role: UserRole): Promise<UserRoleRecord[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('role', role)

  if (error) throw error
  return data || []
}
