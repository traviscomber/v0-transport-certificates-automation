import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin, type UserRole as AuthUserRole } from '@/lib/auth-middleware'

export type CanChangeDocumentStatusResult = {
  allowed: boolean
  reason?: string
}

/**
 * Check if a user can change document status
 * Rules:
 * 1. Super-admins (Labbe/mandante users) can change status on ANY document
 * 2. Administrators (admin) from the SAME company can change status
 * 3. The document's conductor must belong to the same company/transportista
 */
export async function canChangeDocumentStatus(
  userId: string,
  documentId: string,
  userRole: AuthUserRole,
  userCompanyId?: string,
  userEmail?: string
): Promise<CanChangeDocumentStatusResult> {
  console.log('[v0] canChangeDocumentStatus called:', { userId, documentId, userRole, userCompanyId, userEmail })
  
  // SUPER-ADMIN BYPASS: Labbe (mandante) users can manage ALL documents
  // regardless of which transportista the conductor belongs to
  if (isSuperAdmin(userEmail, userRole)) {
    console.log('[v0] AUTH ALLOW - Super-admin (Labbe/mandante) bypass:', { userId, userEmail, userRole })
    return { allowed: true }
  }

  // Super-admin bypass
  if (isSuperAdmin(userEmail, userRole)) {
    console.log('[v0] AUTH ALLOW - Super-admin (Labbe/mandante) bypass:', { userId, userEmail, userRole })
    return { allowed: true }
  }

  // Allow admin AND ejecutiva role to change document status
  // Executives (ejecutiva) and administrators both manage documents
  const allowedRoles = ['admin', 'ejecutiva']
  if (!allowedRoles.includes(userRole)) {
    console.log('[v0] AUTH DENY - Role check failed:', { userId, userRole, documentId, allowedRoles })
    return {
      allowed: false,
      reason: `Solo administradores y ejecutivas pueden cambiar el estado de documentos. Tu rol es: ${userRole}`,
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
      console.log('[v0] AUTH DENY - Document not found:', docError)
      return {
        allowed: false,
        reason: 'Documento no encontrado',
      }
    }

    // Get the conductor and their transportista (company)
    const { data: conductor, error: conductorError } = await adminClient
      .from('conductores')
      .select('transportista_id')
      .eq('id', document.conductor_id)
      .single()

    console.log('[v0] AUTH - Conductor lookup:', { conductor_id: document.conductor_id, found: !!conductor, transportista_id: conductor?.transportista_id, error: conductorError?.message })

    if (conductorError || !conductor) {
      console.log('[v0] AUTH DENY - Conductor not found:', conductorError)
      return {
        allowed: false,
        reason: 'Conductor del documento no encontrado',
      }
    }

    // Get the user's company from profiles
    // Note: profiles.organization_id maps to transportistas.id
    const { data: userProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    console.log('[v0] AUTH - User profile lookup:', { userId, found: !!userProfile, user_org_id: userProfile?.organization_id, profileError: profileError?.message })

    if (profileError) {
      console.log('[v0] AUTH WARNING - Profile lookup error:', profileError?.message)
      // Don't fail immediately, try to use userCompanyId parameter as fallback
      if (!userCompanyId) {
        console.log('[v0] AUTH DENY - No profile found and no userCompanyId provided')
        return {
          allowed: false,
          reason: 'Perfil de usuario no encontrado',
        }
      }
    }

    // Use organization_id from profile (maps to transportista_id), fallback to userCompanyId parameter
    const userTransportista = userProfile?.organization_id || userCompanyId
    const conductorTransportista = conductor.transportista_id
    
    console.log('[v0] AUTH - Final company comparison:', { 
      user_transportista_from_profile: userProfile?.organization_id,
      user_transportista_from_param: userCompanyId,
      final_user_transportista: userTransportista,
      conductor_transportista: conductorTransportista
    })

    if (!userTransportista) {
      console.log('[v0] AUTH DENY - No transportista/organization found for user')
      return {
        allowed: false,
        reason: 'No se encontró la empresa del usuario',
      }
    }

    // Check if user's transportista matches conductor's transportista
    const companyMatch = userTransportista === conductorTransportista
    
    console.log('[v0] AUTH - Company match:', { userTransportista, conductorTransportista, match: companyMatch })

    if (!companyMatch) {
      console.log('[v0] AUTH DENY - Company mismatch:', { user_transportista: userTransportista, conductor_transportista: conductorTransportista })
      return {
        allowed: false,
        reason: 'No tienes permiso para cambiar documentos de otra empresa',
      }
    }

    // All checks passed
    console.log('[v0] AUTH ALLOW - All checks passed:', { userId, documentId, userRole, userTransportista })
    return {
      allowed: true,
    }
  } catch (error) {
    console.error('[v0] canChangeDocumentStatus EXCEPTION:', error)
    return {
      allowed: false,
      reason: 'Error al verificar permisos: ' + (error instanceof Error ? error.message : 'Unknown error'),
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

