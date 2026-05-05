import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole as AuthUserRole } from '@/lib/auth-middleware'

export type CanChangeDocumentStatusResult = {
  allowed: boolean
  reason?: string
}

/**
 * Check if a user can change document status
 * Rules:
 * 1. Administrators (admin) from the SAME company can change status
 * 2. The document's conductor must belong to the same company
 */
export async function canChangeDocumentStatus(
  userId: string,
  documentId: string,
  userRole: AuthUserRole,
  userCompanyId?: string
): Promise<CanChangeDocumentStatusResult> {
  // Only admin role can change document status
  if (userRole !== 'admin') {
    console.log('[v0] AUTH DENY - Role check failed:', { userId, userRole, documentId })
    return {
      allowed: false,
      reason: `Solo administradores pueden cambiar el estado de documentos. Tu rol es: ${userRole}`,
    }
  }

  try {
    console.log('[v0] AUTH CHECK START:', { userId, documentId, userRole, userCompanyId })
    
    const adminClient = await createAdminClient()

    // Get the document and its conductor
    const { data: document, error: docError } = await adminClient
      .from('uploaded_documents')
      .select('conductor_id')
      .eq('id', documentId)
      .single()

    console.log('[v0] AUTH - Document lookup:', { documentId, found: !!document, error: docError?.message })

    if (docError || !document) {
      return {
        allowed: false,
        reason: 'Documento no encontrado',
      }
    }

    // Get the conductor and their company
    const { data: conductor, error: conductorError } = await adminClient
      .from('conductores')
      .select('empresa_id')
      .eq('id', document.conductor_id)
      .single()

    console.log('[v0] AUTH - Conductor lookup:', { conductor_id: document.conductor_id, found: !!conductor, empresa_id: conductor?.empresa_id, error: conductorError?.message })

    if (conductorError || !conductor) {
      return {
        allowed: false,
        reason: 'Conductor del documento no encontrado',
      }
    }

    // Get the user's company from profiles
    const { data: userProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    console.log('[v0] AUTH - User profile lookup:', { userId, found: !!userProfile, user_org_id: userProfile?.organization_id, error: profileError?.message })

    if (profileError || !userProfile) {
      return {
        allowed: false,
        reason: 'Perfil de usuario no encontrado',
      }
    }

    // Check if user's company matches conductor's company
    const companyMatch = userProfile.organization_id === conductor.empresa_id
    console.log('[v0] AUTH - Company match check:', { 
      user_org: userProfile.organization_id, 
      conductor_empresa: conductor.empresa_id, 
      match: companyMatch
    })

    if (!companyMatch) {
      console.log('[v0] AUTH DENY - Company mismatch:', { user_org_id: userProfile.organization_id, conductor_empresa_id: conductor.empresa_id })
      return {
        allowed: false,
        reason: 'No tienes permiso para cambiar documentos de otra empresa',
      }
    }

    // All checks passed
    console.log('[v0] AUTH ALLOW - All checks passed:', { userId, documentId, userRole })
    return {
      allowed: true,
    }
  } catch (error) {
    console.error('[v0] canChangeDocumentStatus error:', error)
    return {
      allowed: false,
      reason: 'Error al verificar permisos',
    }
  }
}

/**
 * Get all executives (admin role) from a company
 * These users can change document status on behalf of the company
 */
export async function getCompanyExecutives(
  companyId: string
): Promise<
  Array<{
    id: string
    email: string
    role: AuthUserRole
  }>
> {
  try {
    const adminClient = await createAdminClient()

    const { data, error } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .eq('organization_id', companyId)
      .eq('role', 'admin')

    if (error || !data) {
      console.error('[v0] getCompanyExecutives error:', error)
      return []
    }

    return data.map(profile => ({
      id: profile.id,
      email: profile.email,
      role: profile.role as AuthUserRole,
    }))
  } catch (error) {
    console.error('[v0] getCompanyExecutives error:', error)
    return []
  }
}

/**
 * Check if a user is an executive (admin role)
 */
export function isExecutive(userRole: AuthUserRole): boolean {
  return userRole === 'admin'
}

