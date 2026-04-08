'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { UserRole } from '@/lib/rbac-access-control'

interface RoleContextType {
  userId: string | null
  role: UserRole | null
  loading: boolean
  permissions: string[]
}

const RoleContext = createContext<RoleContextType>({
  userId: null,
  role: null,
  loading: true,
  permissions: [],
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<RoleContextType>({
    userId: null,
    role: null,
    loading: true,
    permissions: [],
  })

  useEffect(() => {
    // Fetch user role on mount
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/roles')
        if (response.ok) {
          const data = await response.json()
          setContext({
            userId: data.data.userId,
            role: data.data.primaryRole,
            loading: false,
            permissions: [],
          })
        } else {
          setContext(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('[v0] Error fetching user role:', error)
        setContext(prev => ({ ...prev, loading: false }))
      }
    }

    fetchUserRole()
  }, [])

  return (
    <RoleContext.Provider value={context}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return context
}
