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
  userEmail?: string,
  documentType: 'conductor' | 'subcontractor' = 'conductor'
): Promise<CanChangeDocumentStatusResult> {
  console.log('[v0] canChangeDocumentStatus called:', {
    userId,
    documentId,
    userRole,
    userCompanyId,
    userEmail,
    documentType,
  })
  
  // SUPER-ADMIN BYPASS: Labbe (mandante) users can manage ALL documents
  // regardless of which transportista the conductor belongs to
  const isSuperAdminUser = isSuperAdmin(userEmail, userRole)
  console.log('[v0] Super-admin check:', { isSuperAdminUser, userEmail, userRole })
  
  if (isSuperAdminUser) {
    console.log('[v0] AUTH ALLOW - Super-admin (Labbe/@labbe.cl) bypass:', { userId, userEmail, userRole })
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

    const tableName = documentType === 'subcontractor' ? 'subcontractor_documents' : 'uploaded_documents'
    const companyField = documentType === 'subcontractor' ? 'subcontractor_id' : 'conductor_id'

    // Get the document and its owning company relation
    const { data: document, error: docError } = await adminClient
      .from(tableName)
      .select(companyField)
      .eq('id', documentId)
      .single()

    console.log('[v0] AUTH - Document lookup:', {
      documentId,
      tableName,
      companyField,
      found: !!document,
      error: docError?.message,
    })

    if (docError || !document) {
      console.log('[v0] AUTH DENY - Document not found:', docError)
      return {
        allowed: false,
        reason: 'Documento no encontrado',
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
    const documentTransportista =
      documentType === 'subcontractor'
        ? (document as { subcontractor_id?: string | null })?.subcontractor_id
        : (document as { conductor_id?: string | null })?.conductor_id
    
    console.log('[v0] AUTH - Final company comparison:', { 
      user_transportista_from_profile: userProfile?.organization_id,
      user_transportista_from_param: userCompanyId,
      final_user_transportista: userTransportista,
      document_transportista: documentTransportista
    })

    if (!userTransportista) {
      console.log('[v0] AUTH DENY - No transportista/organization found for user')
      return {
        allowed: false,
        reason: 'No se encontró la empresa del usuario',
      }
    }

    // Check if user's transportista matches the document's owning company
    const companyMatch = userTransportista === documentTransportista
    
    console.log('[v0] AUTH - Company match:', { userTransportista, documentTransportista, match: companyMatch })

    if (!companyMatch) {
      console.log('[v0] AUTH DENY - Company mismatch:', { user_transportista: userTransportista, document_transportista: documentTransportista })
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

