'use client'

// Single source of truth for demo accounts - Real ejecutivas
export const DEMO_ACCOUNTS = [
  {
    role: 'ejecutiva',
    title: 'Ejecutiva',
    name: 'Olga Carrasco',
    email: 'olga.carrasco@labbe.cl',
    password: 'labbe4005',
  },
  {
    role: 'ejecutiva',
    title: 'Ejecutiva',
    name: 'Carolina Sepulveda',
    email: 'carolina.sepulveda@labbe.cl',
    password: 'labbe4094',
  },
  {
    role: 'ejecutiva',
    title: 'Ejecutiva',
    name: 'Daniela Silva',
    email: 'daniela.silva@labbe.cl',
    password: 'labbe8246',
  },
  {
    role: 'ejecutiva',
    title: 'Ejecutiva',
    name: 'Javiera Ayala',
    email: 'jayala@labbe.cl',
    password: 'labbe0987',
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
