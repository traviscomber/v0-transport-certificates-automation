'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'mandante' | 'transportista'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string
  company_name?: string
  avatar_url?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  isAuthenticated: boolean
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Función para extraer rol del email
  const getRoleFromEmail = (email: string): UserRole => {
    const emailPrefix = email.split('@')[0].toLowerCase()
    if (emailPrefix === 'admin') return 'admin'
    if (emailPrefix === 'despachador') return 'dispatcher'
    if (emailPrefix === 'transportista') return 'transportista'
    if (emailPrefix === 'mandante') return 'mandante'
    return 'driver'
  }

  // Verificar sesión al montar el componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: getRoleFromEmail(session.user.email || ''),
            full_name: session.user.email?.split('@')[0] || '',
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[v0] Error checking session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: getRoleFromEmail(session.user.email || ''),
          full_name: session.user.email?.split('@')[0] || '',
        })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[v0] Auth error:', error.message)
        throw error
      }

      if (data.session?.user) {
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || email,
          role: getRoleFromEmail(data.session.user.email || email),
          full_name: (data.session.user.email || email).split('@')[0],
        }
        setUser(userData)
        console.log('[v0] Login successful:', userData)
        return
      } else {
        throw new Error('No session returned from login')
      }
    } catch (error) {
      console.error('[v0] Login error:', error)
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setLoading(false)
    } catch (error) {
      console.error('[v0] Logout error:', error)
      setLoading(false)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) throw error
      setLoading(false)
    } catch (error) {
      console.error('[v0] Register error:', error)
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

