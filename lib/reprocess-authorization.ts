import type { NextRequest } from 'next/server'
import { verifyAuth, type UserRole } from '@/lib/auth-middleware'
import { canChangeDocumentStatus } from '@/lib/document-authorization'

export type ReprocessDocumentTable = 'subcontractor_documents' | 'uploaded_documents'

type ReprocessUser = {
  id: string
  email: string
  role: UserRole
  organization_id?: string
}

export type ReprocessActor =
  | { kind: 'cron' }
  | { kind: 'user'; user: ReprocessUser }

export type ReprocessAuthenticationResult =
  | { ok: true; actor: ReprocessActor }
  | { ok: false; status: 401; error: string }

export type ReprocessAuthorizationResult = {
  allowed: boolean
  reason?: string
}

function hasValidCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`)
}

/**
 * Authenticate before any privileged database access.
 * Human requests use the canonical app auth flow. F30 backfill must present
 * CRON_SECRET explicitly; merely claiming source=f30_backfill is never enough.
 */
export async function authenticateReprocessRequest(
  request: NextRequest,
  source: string | null,
): Promise<ReprocessAuthenticationResult> {
  if (source === 'f30_backfill') {
    if (!hasValidCronSecret(request)) {
      return { ok: false, status: 401, error: 'Unauthorized' }
    }
    return { ok: true, actor: { kind: 'cron' } }
  }

  const { user, error } = await verifyAuth(request)
  if (error || !user) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }

  return { ok: true, actor: { kind: 'user', user } }
}

/**
 * Authorize only after the canonical document table has been resolved.
 * Cron is restricted to the F30/subcontractor surface. Human requests reuse
 * the assignment-aware document mutation contract.
 */
export async function authorizeReprocessDocument(
  actor: ReprocessActor,
  documentId: string,
  documentTable: ReprocessDocumentTable,
): Promise<ReprocessAuthorizationResult> {
  if (actor.kind === 'cron') {
    return documentTable === 'subcontractor_documents'
      ? { allowed: true }
      : { allowed: false, reason: 'F30 backfill cannot reprocess uploaded documents' }
  }

  const documentType = documentTable === 'subcontractor_documents' ? 'subcontractor' : 'conductor'
  return canChangeDocumentStatus(
    actor.user.id,
    documentId,
    actor.user.role,
    actor.user.organization_id,
    actor.user.email,
    documentType,
  )
}
