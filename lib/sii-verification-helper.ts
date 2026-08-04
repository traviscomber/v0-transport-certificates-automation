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
 * This calls a server-side API route to fetch the verification status
 */
export async function getOrVerifySIIStatus(
  transportistaId: string,
  transportistaRut: string,
): Promise<DocumentSIIStatus> {
  try {
    // Call server-side API to fetch verification status (avoiding client-side env var access)
    const response = await fetch('/api/sii/verification-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transportistaId,
        transportistaRut,
      }),
    })

    if (!response.ok) {
      console.error('[v0] API error fetching SII status:', response.status)
      return {
        documentId: transportistaId,
        status: 'pending',
        rut: transportistaRut,
      }
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('[v0] Error getting SII status:', error)
    return {
      documentId: transportistaId,
      status: 'pending',
      rut: transportistaRut,
    }
  }
}

/**
 * Trigger async SII verification for a transportista
 * Calls server-side API which validates SII_TAX_STATUS_CANARY_ENABLED
 * Returns immediately; verification runs in background
 */
export async function triggerSIIVerification(transportistaId: string, rut: string): Promise<void> {
  try {
    const response = await fetch('/api/sii/trigger-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transportistaId,
        transportistaRut: rut,
      }),
    })

    if (!response.ok) {
      console.warn('[v0] Trigger verification returned status:', response.status)
    }
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
