import { createClient } from '@supabase/supabase-js'

export type SIIVerificationStatus = 'verified' | 'failed' | 'pending' | 'blocked'

export interface DocumentSIIStatus {
  documentId: string
  status: SIIVerificationStatus
  rut?: string
  verifiedAt?: string
  errorCode?: string
  confidence?: number
}

/**
 * Get or trigger SII verification for a document's associated transportista RUT
 * Returns verification status and results from the external_verification_runs table
 */
export async function getOrVerifySIIStatus(
  transportistaId: string,
  transportistaRut: string,
): Promise<DocumentSIIStatus> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  )

  try {
    // Check if we already have a recent verification for this RUT
    const { data: existingRuns, error: queryError } = await supabase
      .from('external_verification_runs')
      .select('id, status, normalized_result, created_at, expires_at')
      .eq('source_code', 'sii_tax_status')
      .eq('entity_type', 'transportista')
      .eq('entity_id', transportistaId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('[v0] Error querying verification runs:', queryError)
      return {
        documentId: transportistaId,
        status: 'pending',
        rut: transportistaRut,
      }
    }

    // If we have a cached valid result, return it
    if (existingRuns && existingRuns.length > 0) {
      const run = existingRuns[0]
      const status =
        run.status === 'success' ? 'verified' : run.status === 'failed' ? 'failed' : 'pending'

      return {
        documentId: transportistaId,
        status,
        rut: transportistaRut,
        verifiedAt: run.created_at,
        confidence: (run.normalized_result as any)?.confidence || undefined,
      }
    }

    // No cached result - would need to trigger verification via API
    // (This would be done asynchronously via the SII canary endpoint)
    return {
      documentId: transportistaId,
      status: 'pending',
      rut: transportistaRut,
    }
  } catch (error) {
    console.error('[v0] Error getting SII status:', error)
    return {
      documentId: transportistaId,
      status: 'failed',
      rut: transportistaRut,
    }
  }
}

/**
 * Trigger async SII verification for a transportista
 * Returns immediately; verification runs in background
 */
export async function triggerSIIVerification(transportistaId: string, rut: string): Promise<void> {
  if (!process.env.EXTERNAL_VERIFICATION_LAB_ENABLED) {
    return
  }

  try {
    await fetch('/api/internal/external-verification/sii', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXTERNAL_VERIFICATION_LAB_TOKEN || ''}`,
      },
      body: JSON.stringify({
        rut,
        transportistaId,
      }),
    })
  } catch (error) {
    console.error('[v0] Error triggering SII verification:', error)
  }
}

/**
 * Get a visual badge config based on SII verification status
 */
export function getSIIStatusBadge(status: SIIVerificationStatus): {
  label: string
  color: string
  icon: string
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verificado SII',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: '✓',
      }
    case 'failed':
      return {
        label: 'Error SII',
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: '✗',
      }
    case 'blocked':
      return {
        label: 'Bloqueado',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: '⚠',
      }
    case 'pending':
    default:
      return {
        label: 'Verificando SII',
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        icon: '◌',
      }
  }
}
