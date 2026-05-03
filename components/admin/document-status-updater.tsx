'use client'

import { useState } from 'react'
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
}

export function DocumentStatusUpdater({
  documentId,
  currentStatus,
  onStatusChange,
}: DocumentStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [localStatus, setLocalStatus] = useState(currentStatus)

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
      setIsUpdating(true)
      
      // Step 1: Update status in API
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation_status: status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update document status')
      }

      // Step 2: Verify the update by refetching the document
      const verifyResponse = await fetch(`/api/documents/${documentId}`)
      if (verifyResponse.ok) {
        const verifiedData = await verifyResponse.json()
        // Confirm the status was actually updated in the database
        if (verifiedData.validation_status === status) {
          setLocalStatus(status)
          onStatusChange(status)
        } else {
          // If verification failed, force a page reload to get fresh data
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        setLocalStatus(status)
        onStatusChange(status)
      }
    } catch (error) {
      // Silent error handling - state remains unchanged
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select value={localStatus} onValueChange={handleStatusUpdate} disabled={isUpdating}>
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
