'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'mandante' | 'transportista' | 'executive'

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
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  isAuthenticated: boolean
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role?: string
  company_name?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función helper para obtener mensaje de error amigable
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  
  if (error?.message) {
    const msg = error.message.toLowerCase()
    
    // Errores de Supabase Auth
    if (msg.includes('invalid login credentials') || msg.includes('wrong password')) {
      return 'Correo o contraseña incorrectos'
    }
    if (msg.includes('user already registered')) {
      return 'El correo ya está registrado'
    }
    if (msg.includes('invalid email')) {
      return 'El correo electrónico no es válido'
    }
    if (msg.includes('password')) {
      return 'La contraseña no cumple con los requisitos de seguridad'
    }
    if (msg.includes('network')) {
      return 'Error de conexión. Por favor intenta de nuevo'
    }
    
    return error.message
  }
  
  return 'Ha ocurrido un error. Por favor intenta de nuevo'
}

// Initialize client once at module level so it's always ready
const supabaseClient = createClient()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para extraer rol del email
  const getRoleFromEmail = (email: string): UserRole => {
    const emailPrefix = email.split('@')[0].toLowerCase()
    if (emailPrefix === 'admin') return 'admin'
    if (emailPrefix === 'despachador') return 'dispatcher'
    if (emailPrefix === 'transportista') return 'transportista'
    if (emailPrefix === 'mandante') return 'mandante'
    return 'driver'
  }

  useEffect(() => {
    console.log('[v0] Setting up auth state listener')
    
    try {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        try {
          console.log('[v0] Auth state changed:', _event)
          if (!session) {
            setUser(null)
            setError(null)
          } else if (session.user) {
            const meta = session.user.user_metadata || {}
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: (meta.role as UserRole) || getRoleFromEmail(session.user.email || ''),
              full_name: meta.full_name || session.user.email?.split('@')[0] || 'Usuario',
              company_name: meta.company_name,
            })
            setError(null)
          }
          setLoading(false)
        } catch (callbackError) {
          console.error('[v0] Auth state callback error:', callbackError)
          setLoading(false)
        }
      })

      return () => {
        try {
          subscription?.unsubscribe()
        } catch (unsubError) {
          console.error('[v0] Error unsubscribing:', unsubError)
        }
      }
    } catch (setupError) {
      console.error('[v0] Error setting up auth listener:', setupError)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('[v0] Login attempt for:', email)
      setLoading(true)
      setError(null)

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[v0] Login error:', error.message)
        const errorMessage = getErrorMessage(error)
        setError(errorMessage)
        setLoading(false)
        throw error
      }

      if (!data.session?.user) {
        console.error('[v0] No session returned')
        setError('No se recibió sesión del servidor')
        setLoading(false)
        throw new Error('No session returned from login')
      }

      console.log('[v0] Login successful for:', email)
      const meta = data.session.user.user_metadata || {}
      setUser({
        id: data.session.user.id,
        email: data.session.user.email || email,
        role: (meta.role as UserRole) || getRoleFromEmail(data.session.user.email || email),
        full_name: meta.full_name || (data.session.user.email || email).split('@')[0],
        company_name: meta.company_name,
      })
      setError(null)
      setLoading(false)
    } catch (error) {
      console.error('[v0] Login catch error:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
      setUser(null)
      setError(null)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      setError(null)

      const { data: authData, error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role || 'driver',
            company_name: data.company_name,
          }
        }
      })

      if (error) {
        const errorMessage = getErrorMessage(error)
        setError(errorMessage)
        setLoading(false)
        throw error
      }

      if (!authData.user?.id) {
        throw new Error('No user ID returned from signup')
      }

      setUser({
        id: authData.user.id,
        email: authData.user.email || data.email,
        role: (data.role as UserRole) || 'driver',
        full_name: data.full_name,
        company_name: data.company_name,
      })
      setError(null)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
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

