'use client'

import { useRole } from '@/app/providers'
import { UserRole } from '@/lib/auth-context'
import { ReactNode } from 'react'

interface RoleGuardProps {
  requiredRole: UserRole | UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { user, loading } = useRole()
  const role = user?.role

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Cargando...</div>
  }

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const hasAccess = role && requiredRoles.includes(role)

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-lg font-semibold text-red-600">Acceso Denegado</h2>
          <p className="text-sm text-muted-foreground mt-2">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Rol requerido: {requiredRoles.join(', ')}
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
