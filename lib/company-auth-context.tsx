'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CompanySession {
  id: string
  rut: string
  name: string
  email: string
  is_labbe_admin: boolean
}

interface CompanyAuthContextType {
  session: CompanySession | null
  isLoading: boolean
  logout: () => Promise<void>
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined)

export function CompanyAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CompanySession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar sesión desde localStorage o cookies
    const loadSession = async () => {
      try {
        // En el cliente, podemos verificar si hay una sesión activa
        // La validación real ocurre en el servidor con cookies HTTP-only
        const sessionData = localStorage.getItem('company_session')
        if (sessionData) {
          setSession(JSON.parse(sessionData))
        }
      } catch (err) {
        console.error('[v0] Error loading session:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setSession(null)
      localStorage.removeItem('company_session')
      window.location.href = '/auth/login-company'
    } catch (err) {
      console.error('[v0] Logout error:', err)
    }
  }

  return (
    <CompanyAuthContext.Provider value={{ session, isLoading, logout }}>
      {children}
    </CompanyAuthContext.Provider>
  )
}

export function useCompanyAuth() {
  const context = useContext(CompanyAuthContext)
  if (context === undefined) {
    throw new Error('useCompanyAuth must be used within CompanyAuthProvider')
  }
  return context
}
