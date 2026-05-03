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
