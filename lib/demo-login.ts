'use client'

// Single source of truth for demo accounts
export const DEMO_ACCOUNTS = [
  {
    role: 'driver',
    title: 'Conductor',
    name: 'Conductor',
    email: 'conductor@demo.cl',
    password: 'demo123',
  },
  {
    role: 'dispatcher',
    title: 'Despachador',
    name: 'Despachador',
    email: 'despachador@demo.cl',
    password: 'demo123',
  },
  {
    role: 'admin',
    title: 'Administrador',
    name: 'Administrador',
    email: 'admin@demo.cl',
    password: 'demo123',
  },
]

// Global flag to prevent simultaneous login attempts
let isAuthenticating = false

/**
 * Perform demo login by calling the dedicated demo-login API
 * This bypasses standard Supabase auth since demo accounts have special password hashing
 */
export async function performDemoLogin(
  email: string,
  password: string,
  login: (email: string, password: string) => Promise<void>
): Promise<void> {
  // Guard: prevent simultaneous authentication attempts
  if (isAuthenticating) {
    console.warn('[v0] [DEMO_LOGIN] Login already in progress, ignoring duplicate request')
    throw new Error('Ya hay un login en progreso')
  }

  try {
    isAuthenticating = true
    const account = DEMO_ACCOUNTS.find(acc => acc.email === email)
    
    console.log(`[v0] [DEMO_LOGIN] Iniciando demo login`, { 
      email, 
      role: account?.role 
    })

    // Try the demo-login API first
    const response = await fetch('/api/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      console.error('[v0] Demo login API failed:', response.status)
      // Fall back to standard login
      await login(email, password)
    } else {
      const data = await response.json()
      if (data.success) {
        console.log(`[v0] [DEMO_LOGIN] Demo login completado exitosamente`, { 
          email, 
          role: account?.role 
        })
        // Use standard login to establish session
        await login(email, password)
      } else {
        throw new Error(data.error || 'Demo login failed')
      }
    }
  } finally {
    // Always reset the flag, even if there's an error
    isAuthenticating = false
  }
}

/**
 * Get demo account by email
 */
export function getDemoAccountByEmail(email: string) {
  return DEMO_ACCOUNTS.find(acc => acc.email === email)
}

/**
 * Get demo account by role
 */
export function getDemoAccountByRole(role: string) {
  return DEMO_ACCOUNTS.find(acc => acc.role === role)
}
