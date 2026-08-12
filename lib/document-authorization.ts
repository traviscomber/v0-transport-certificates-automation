import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin, type UserRole as AuthUserRole } from '@/lib/auth-middleware'

export type CanChangeDocumentStatusResult = {
  allowed: boolean
  reason?: string
}

/**
 * Check if a user can change document status.
 * The caller identity must already come from the signed server actor contract.
 */
export async function canChangeDocumentStatus(
  userId: string,
  documentId: string,
  userRole: string,
  userCompanyId?: string,
  userEmail?: string,
  documentType: 'conductor' | 'subcontractor' = 'conductor'
): Promise<CanChangeDocumentStatusResult> {
  const isSuperAdminUser = isSuperAdmin(userEmail, userRole)
  if (isSuperAdminUser) {
    return { allowed: true }
  }

  const allowedRoles = ['admin', 'ejecutiva']
  if (!allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Solo administradores y ejecutivas pueden cambiar el estado de documentos. Tu rol es: ${userRole}`,
    }
  }

  try {
    const adminClient = createAdminClient()

    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle()

    const userTransportista = userProfile?.organization_id || userCompanyId || null
    if (!userTransportista) {
      return {
        allowed: false,
        reason: 'No se encontró la empresa del usuario',
      }
    }

    let documentTransportista: string | null = null

    if (documentType === 'subcontractor') {
      const { data: document, error: docError } = await adminClient
        .from('subcontractor_documents')
        .select('subcontractor_id')
        .eq('id', documentId)
        .maybeSingle()

      if (docError || !document) {
        return { allowed: false, reason: 'Documento no encontrado' }
      }

      documentTransportista = document.subcontractor_id || null
    } else {
      const { data: document, error: docError } = await adminClient
        .from('uploaded_documents')
        .select('conductor_id')
        .eq('id', documentId)
        .maybeSingle()

      if (docError || !document?.conductor_id) {
        return { allowed: false, reason: 'Documento no encontrado' }
      }

      const { data: conductor, error: conductorError } = await adminClient
        .from('conductores')
        .select('transportista_id')
        .eq('id', document.conductor_id)
        .maybeSingle()

      if (conductorError || !conductor?.transportista_id) {
        return { allowed: false, reason: 'No se encontró la empresa del documento' }
      }

      documentTransportista = conductor.transportista_id
    }

    if (userTransportista !== documentTransportista) {
      return {
        allowed: false,
        reason: 'No tienes permiso para cambiar documentos de otra empresa',
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('[auth] canChangeDocumentStatus failed:', error)
    return {
      allowed: false,
      reason: 'Error al verificar permisos',
    }
  }
}

/**
 * Get all executives (admin role) from a company.
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
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .eq('organization_id', companyId)
      .eq('role', 'admin')

    if (error || !data) {
      console.error('[auth] getCompanyExecutives failed:', error)
      return []
    }

    return data.map((profile) => ({
      id: profile.id,
      email: profile.email,
      role: profile.role as AuthUserRole,
    }))
  } catch (error) {
    console.error('[auth] getCompanyExecutives failed:', error)
    return []
  }
}

export function isExecutive(userRole: AuthUserRole): boolean {
  return userRole === 'admin'
}
