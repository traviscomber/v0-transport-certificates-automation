import { useState, useEffect } from 'react'

type UserRole = 'conductor' | 'empresa' | 'labbé' | 'unknown'

export function useRole(): UserRole {
  const [role, setRole] = useState<UserRole>('unknown')

  useEffect(() => {
    // En producción, esto vendría del contexto de auth o sesión
    // Por ahora, detectamos basado en localStorage o hardcodeamos para demo
    const storedRole = localStorage.getItem('userRole') as UserRole | null
    
    if (storedRole) {
      setRole(storedRole)
    } else {
      // Default: conductor
      setRole('conductor')
    }
  }, [])

  return role
}
