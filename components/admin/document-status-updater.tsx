'use client'

import { useState, useEffect } from 'react'
import { useDocumentStatusChange } from '@/hooks/use-document-status-change'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface DocumentStatusUpdaterProps {
  documentId: string
  currentStatus: 'approved' | 'rejected' | 'pending'
  onStatusChange: (status: 'approved' | 'rejected' | 'pending') => void
  documentType?: 'conductor' | 'subcontractor'
}

export function DocumentStatusUpdater({
  documentId,
  currentStatus,
  onStatusChange,
  documentType = 'conductor',
}: DocumentStatusUpdaterProps) {
  const [localStatus, setLocalStatus] = useState(currentStatus)
  const [mounted, setMounted] = useState(false)
  const { state, actions } = useDocumentStatusChange(documentId, undefined, documentType)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado'
      case 'rejected':
        return 'Rechazado'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    const status = newStatus as 'approved' | 'rejected' | 'pending'
    if (status === localStatus) return

    try {
      const result = await actions.changeStatus(status)
      
      if (result.success) {
        setLocalStatus(status)
        onStatusChange(status)
      } else {
        console.error('[v0] Status change failed:', result.message)
      }
    } catch (err) {
      console.error('[v0] Error changing status:', err)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Select value={localStatus} onValueChange={handleStatusUpdate} disabled={state.loading}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        </SelectItem>
        <SelectItem value="approved">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprobado
          </span>
        </SelectItem>
        <SelectItem value="rejected">
          <span className="inline-flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rechazado
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
