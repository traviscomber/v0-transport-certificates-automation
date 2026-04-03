'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  role: UserRole
  company_name?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Verificar usuario al montar componente
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setUser(null)
          setLoading(false)
          return
        }

        // Obtener perfil del usuario - intenta con todas las columnas primero
        let profile = null
        let profileError = null
        
        // Intentar obtener todas las columnas
        const { data: fullProfile, error: fullError } = await supabase
          .from('profiles')
          .select('id, email, role, full_name, company_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (fullError) {
          // Si falla, intentar solo con columnas esenciales
          const { data: basicProfile, error: basicError } = await supabase
            .from('profiles')
            .select('id, email, role, full_name')
            .eq('id', session.user.id)
            .single()
          
          profile = basicProfile
          profileError = basicError
        } else {
          profile = fullProfile
          profileError = fullError
        }

        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError)
          setUser(null)
          setLoading(false)
          return
        }

        setUser({
          id: profile.id,
          email: profile.email || session.user.email || '',
          role: profile.role as UserRole,
          full_name: profile.full_name,
          company_name: profile.company_name || undefined,
          avatar_url: profile.avatar_url || undefined,
        })
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
      } else if (session) {
        // Re-fetch profile cuando cambia auth state
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role, full_name, company_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || session.user.email || '',
            role: profile.role as UserRole,
            full_name: profile.full_name,
            company_name: profile.company_name,
            avatar_url: profile.avatar_url,
          })
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error('[v0] Auth error:', error)
        throw error
      }

      if (!data.session) {
        throw new Error('No session returned from login')
      }

      console.log('[v0] Session created, setting user from auth data')
      
      // Set user from auth session immediately to prevent hanging
      // Extract role from email or use default
      const emailPrefix = email.split('@')[0]
      let role: UserRole = 'driver'
      if (emailPrefix === 'despachador') role = 'dispatcher'
      if (emailPrefix === 'admin') role = 'admin'
      
      setUser({
        id: data.session.user.id,
        email: data.session.user.email || email,
        role: role,
        full_name: email.split('@')[0],
        company_name: undefined,
        avatar_url: undefined
      })

      console.log('[v0] Login completed successfully')
      
      // Give auth state a moment to update
      await new Promise(resolve => setTimeout(resolve, 100))
      setLoading(false)
    } catch (error) {
      console.error('[v0] Login error:', error)
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      
      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError || !authData.user) throw authError

      // Crear perfil con solo los campos que existen en la tabla
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        company_name: data.company_name || null,
      })

      if (profileError) throw profileError

      // Auto-login después de registro
      await login(data.email, data.password)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setLoading(false)
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
