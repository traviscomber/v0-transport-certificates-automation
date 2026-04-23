'use client'

import useSWR from 'swr'
import { UserListClient } from './user-list-client'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  phone?: string
  is_active: boolean
  created_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function UsuariosListWithSync({ initialUsers }: { initialUsers: User[] }) {
  const { data: users = initialUsers, error, isLoading, mutate } = useSWR<User[]>(
    '/api/company/users',
    fetcher,
    {
      fallbackData: initialUsers,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 0, // No deduping to always fetch fresh
      focusThrottleInterval: 0, // Revalidate immediately on focus
    }
  )

  const handleUserDeleted = async (userId: string) => {
    try {
      console.log('[v0] Deleting user:', userId)
      const response = await fetch(`/api/company/users/${userId}`, { method: 'DELETE' })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      console.log('[v0] User deleted, forcing immediate revalidation')
      // Force immediate revalidation (don't wait for SWR's schedule)
      await mutate(undefined, { revalidate: true })
    } catch (err) {
      console.error('[v0] Delete error in sync handler:', err)
      throw err
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-red-800">Error loading users: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <UserListClient users={users || []} isCompanyContext={true} onDelete={handleUserDeleted} />
}
