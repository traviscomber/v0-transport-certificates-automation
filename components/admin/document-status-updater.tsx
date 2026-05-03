'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

interface DocumentStatusUpdaterProps {
  documentId: string
  currentStatus: 'approved' | 'rejected' | 'pending'
  onStatusChange: (status: 'approved' | 'rejected' | 'pending') => void
  isLoading?: boolean
}

export function DocumentStatusUpdater({
  documentId,
  currentStatus,
  onStatusChange,
  isLoading = false,
}: DocumentStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const statusOptions = [
    { value: 'pending' as const, label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'approved' as const, label: 'Aprobado', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'rejected' as const, label: 'Rechazado', icon: XCircle, color: 'bg-red-100 text-red-700' },
  ]

  const currentOption = statusOptions.find(opt => opt.value === currentStatus)
  const CurrentIcon = currentOption?.icon || Clock

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    if (newStatus === currentStatus) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation_status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update document status')
      }

      onStatusChange(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentOption?.color} hover:opacity-80`}
          disabled={isUpdating || isLoading}
        >
          <CurrentIcon className="h-3 w-3" />
          {currentOption?.label}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            disabled={option.value === currentStatus || isUpdating}
            className={option.value === currentStatus ? 'opacity-50' : ''}
          >
            <option.icon className="h-4 w-4 mr-2" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
