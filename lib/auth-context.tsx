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

// Función helper para obtener timestamp formateado
const getTimestamp = () => new Date().toLocaleTimeString('es-ES', { hour12: false })

// Función helper para loguear con contexto
const logStep = (step: string, details?: any) => {
  const timestamp = getTimestamp()
  if (details) {
    console.log(`[v0] [${timestamp}] ${step}`, details)
  } else {
    console.log(`[v0] [${timestamp}] ${step}`)
  }
}

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null)

  // Initialize Supabase client once
  useEffect(() => {
    try {
      const client = createClient()
      setSupabaseClient(client)
    } catch (err) {
      console.error('[v0] Failed to initialize Supabase:', err)
      setError('Error de configuración: Supabase no está disponible')
      setLoading(false)
    }
  }, [])

  // Función para extraer rol del email
  const getRoleFromEmail = (email: string): UserRole => {
    const emailPrefix = email.split('@')[0].toLowerCase()
    if (emailPrefix === 'admin') return 'admin'
    if (emailPrefix === 'despachador') return 'dispatcher'
    if (emailPrefix === 'transportista') return 'transportista'
    if (emailPrefix === 'mandante') return 'mandante'
    return 'driver'
  }

  // Verificar sesión cuando Supabase está listo
  useEffect(() => {
    if (!supabaseClient) {
      console.log('[v0] Supabase client not ready yet')
      return
    }

    const checkSession = async () => {
      logStep('INIT: Verificando sesión existente')
      try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        if (sessionError) {
          logStep('ERROR: Fallo al obtener sesión', sessionError.message)
          setError('Error al verificar sesión')
          setUser(null)
          return
        }
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: getRoleFromEmail(session.user.email || ''),
            full_name: session.user.email?.split('@')[0] || '',
          }
          logStep('SUCCESS: Sesión existente recuperada', { email: userData.email, role: userData.role })
          setUser(userData)
          setError(null)
        } else {
          logStep('INFO: No hay sesión activa')
          setUser(null)
        }
      } catch (err) {
        logStep('ERROR: Excepción al verificar sesión', err)
        setError('Error al verificar sesión')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escuchar cambios de autenticación
    logStep('INIT: Configurando listener de autenticación')
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      logStep(`AUTH_EVENT: ${event}`)
      
      if (event === 'SIGNED_OUT' || !session) {
        logStep('INFO: Usuario cerró sesión')
        setUser(null)
        setError(null)
        setLoading(false)
      } else if (session?.user) {
        // For new users (just signed up), don't fetch profile - trigger creates it
        // For existing users (just logged in), fetch profile data
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'driver',
          full_name: session.user.email?.split('@')[0] || 'Usuario',
        }
        logStep('INFO: Estado de auth cambió - usuario establecido', { email: userData.email })
        setUser(userData)
        setError(null)
        setLoading(false)
      }
    })

    return () => {
      logStep('CLEANUP: Removiendo listener de autenticación')
      subscription?.unsubscribe()
    }
  }, [supabaseClient])

  const login = async (email: string, password: string) => {
    if (!supabaseClient) {
      throw new Error('Supabase no está disponible')
    }

    const loginId = `login-${Date.now()}`
    try {
      logStep(`LOGIN_START [${loginId}]: Iniciando login`, { email })
      setLoading(true)
      setError(null)
      
      logStep(`LOGIN_AUTH [${loginId}]: Llamando a signInWithPassword`, { email })
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorMessage = getErrorMessage(error)
        logStep(`LOGIN_ERROR [${loginId}]: Error de autenticación`, { 
          code: error.status, 
          message: error.message,
          userMessage: errorMessage 
        })
        setError(errorMessage)
        setLoading(false)
        throw error
      }

      if (!data.session) {
        logStep(`LOGIN_ERROR [${loginId}]: No se retornó sesión`, {})
        setError('No se recibió sesión del servidor')
        setLoading(false)
        throw new Error('No session returned from login')
      }

      logStep(`LOGIN_SESSION [${loginId}]: Sesión creada exitosamente`, { 
        userId: data.session.user.id,
        email: data.session.user.email 
      })

      if (data.session.user) {
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || email,
          role: getRoleFromEmail(data.session.user.email || email),
          full_name: (data.session.user.email || email).split('@')[0],
        }
        
        logStep(`LOGIN_USER [${loginId}]: Usuario establecido`, { 
          id: userData.id,
          email: userData.email,
          role: userData.role 
        })
        
        setUser(userData)
        setError(null)
        
        logStep(`LOGIN_SUCCESS [${loginId}]: Login completado exitosamente`, { 
          email: userData.email, 
          role: userData.role 
        })
        return
      } else {
        throw new Error('User data not found in session')
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      logStep(`LOGIN_EXCEPTION [${loginId}]: Excepción no manejada`, { 
        error: error instanceof Error ? error.message : String(error),
        userMessage: errorMessage
      })
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    if (!supabaseClient) {
      throw new Error('Supabase no está disponible')
    }

    try {
      logStep('LOGOUT_START: Iniciando cierre de sesión')
      setLoading(true)
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        logStep('LOGOUT_ERROR: Error al cerrar sesión', error.message)
        throw error
      }
      logStep('LOGOUT_SUCCESS: Sesión cerrada exitosamente')
      setUser(null)
      setError(null)
      setLoading(false)
    } catch (error) {
      logStep('LOGOUT_EXCEPTION: Excepción en logout', error)
      setLoading(false)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    if (!supabaseClient) {
      throw new Error('Supabase no está disponible')
    }

    try {
      logStep('REGISTER_START: Iniciando registro', { email: data.email })
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
        logStep('REGISTER_ERROR: Error en registro', { message: error.message })
        setError(errorMessage)
        setLoading(false)
        throw error
      }

      if (!authData.user?.id) {
        throw new Error('No user ID returned from signup')
      }

      logStep('REGISTER_AUTH_SUCCESS: Cuenta de auth creada', { userId: authData.user.id })
      setLoading(false)
      logStep('REGISTER_SUCCESS: Registro completado', { email: data.email })
    } catch (error) {
      logStep('REGISTER_EXCEPTION: Excepción en registro', error)
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

