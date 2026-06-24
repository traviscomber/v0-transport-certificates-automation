/**
 * useDocumentStatusChange - Unified hook for document status changes
 * Replaces:
 * - use-document-management.ts updateStatus method
 * - document-status-updater component logic
 * - direct API calls in document-management-panel.tsx
 */

import { useState, useCallback } from 'react'
import { 
  getDocumentStatus,
  getDocumentStatusHistory,
  DocumentStatus,
  DocumentStatusChangeResult,
  DocumentStatusAuditLog 
} from '@/lib/document-status-service'

export interface UseDocumentStatusChangeState {
  loading: boolean
  error: string | null
  success: boolean
  previousStatus: string | null
  currentStatus: DocumentStatus | null
  history: DocumentStatusAuditLog[]
}

export interface UseDocumentStatusChangeActions {
  changeStatus: (newStatus: DocumentStatus, reason?: string) => Promise<DocumentStatusChangeResult>
  refreshStatus: () => Promise<void>
  refreshHistory: () => Promise<void>
  reset: () => void
}

export function useDocumentStatusChange(
  documentId: string,
  onStatusChanged?: (result: DocumentStatusChangeResult) => void,
  documentType: 'conductor' | 'subcontractor' = 'conductor'
) {
  const [state, setState] = useState<UseDocumentStatusChangeState>({
    loading: false,
    error: null,
    success: false,
    previousStatus: null,
    currentStatus: null,
    history: []
  })

  // Change status
  const changeStatus = useCallback(
    async (newStatus: DocumentStatus, reason?: string): Promise<DocumentStatusChangeResult> => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch(`/api/company/documents/${documentId}/status`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            reason,
            documentType,
          }),
        })

        const responseData = await response.json()

        const result: DocumentStatusChangeResult = response.ok
          ? {
              success: true,
              documentId,
              previousStatus: responseData.previous_status || '',
              newStatus: responseData.status || newStatus,
              message: responseData.message || 'Status updated',
            }
          : {
              success: false,
              documentId,
              previousStatus: '',
              newStatus,
              message: responseData.error || 'Error updating status',
              error: responseData.error || 'Error updating status',
            }

        setState(prev => ({
          ...prev,
          loading: false,
          success: result.success,
          previousStatus: result.previousStatus,
          currentStatus: newStatus,
          error: result.error || null
        }))

        if (result.success && onStatusChanged) {
          onStatusChanged(result)
        }

        return result
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setState(prev => ({ ...prev, loading: false, error: errorMsg, success: false }))
        return {
          success: false,
          documentId,
          previousStatus: '',
          newStatus,
          message: errorMsg,
          error: errorMsg
        }
      }
    },
    [documentId, onStatusChanged, documentType]
  )

  // Refresh current status
  const refreshStatus = useCallback(async () => {
    try {
      const status = await getDocumentStatus(documentId)
      setState(prev => ({ ...prev, currentStatus: status }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to refresh status'
      setState(prev => ({ ...prev, error: errorMsg }))
    }
  }, [documentId])

  // Refresh history
  const refreshHistory = useCallback(async () => {
    try {
      const history = await getDocumentStatusHistory(documentId)
      setState(prev => ({ ...prev, history }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to refresh history'
      setState(prev => ({ ...prev, error: errorMsg }))
    }
  }, [documentId])

  // Reset state
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      previousStatus: null,
      currentStatus: null,
      history: []
    })
  }, [])

  return {
    state,
    actions: { changeStatus, refreshStatus, refreshHistory, reset }
  }
}
