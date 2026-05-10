'use client'

import React, { createContext, useContext, useCallback, ReactNode } from 'react'

export type SyncEventType = 'document_uploaded' | 'document_status_changed' | 'documents_refreshed'

export interface DocumentSyncEvent {
  type: SyncEventType
  conductorId?: string
  documentId?: string
  timestamp: number
  data?: any
}

interface DocumentSyncContextType {
  // Trigger a sync event that all listeners will receive
  broadcastSync: (event: DocumentSyncEvent) => void
  // Subscribe to sync events
  onSync: (callback: (event: DocumentSyncEvent) => void) => () => void
}

const DocumentSyncContext = createContext<DocumentSyncContextType | null>(null)

export function DocumentSyncProvider({ children }: { children: ReactNode }) {
  const [listeners, setListeners] = React.useState<Set<(event: DocumentSyncEvent) => void>>(new Set())

  const broadcastSync = useCallback((event: DocumentSyncEvent) => {
    console.log('[v0] DocumentSync: Broadcasting event', event.type, {
      conductorId: event.conductorId,
      documentId: event.documentId,
      timestamp: new Date(event.timestamp).toISOString(),
      listenerCount: listeners.size
    })
    
    // Notify all listeners
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('[v0] DocumentSync: Listener error', error)
      }
    })
  }, [listeners])

  const onSync = useCallback((callback: (event: DocumentSyncEvent) => void) => {
    // Add listener
    setListeners(prev => new Set(prev).add(callback))
    
    // Return unsubscribe function
    return () => {
      setListeners(prev => {
        const newSet = new Set(prev)
        newSet.delete(callback)
        return newSet
      })
    }
  }, [])

  return (
    <DocumentSyncContext.Provider value={{ broadcastSync, onSync }}>
      {children}
    </DocumentSyncContext.Provider>
  )
}

export function useDocumentSync() {
  const context = useContext(DocumentSyncContext)
  if (!context) {
    throw new Error('useDocumentSync must be used within DocumentSyncProvider')
  }
  return context
}
