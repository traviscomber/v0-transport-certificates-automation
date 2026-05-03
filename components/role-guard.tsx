'use client'

import { useAuth } from '@/lib/auth-context'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: string[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>
  }

  if (!user) {
    return fallback || <div className="text-center text-red-500 p-8">No autenticado</div>
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback || <div className="text-center text-red-500 p-8">Sin permisos para ver este contenido</div>
  }

  return <>{children}</>
}
