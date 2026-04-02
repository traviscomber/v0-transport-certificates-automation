'use client'

import { AuthProvider } from '@/lib/auth-context'

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // AuthProvider ahora maneja la autenticación y rol del usuario
  return <AuthProvider>{children}</AuthProvider>
}

export { useAuth as useRole } from '@/lib/auth-context'
