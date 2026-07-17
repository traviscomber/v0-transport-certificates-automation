'use client'

// Single source of truth for access accounts used in the login screen
export const ACCESS_ACCOUNTS = [
  {
    role: 'ejecutiva',
    title: 'Cuenta demo',
    name: 'Ejecutiva 1',
    email: 'ejecutiva1@ejemplo.com',
    password: 'demo1234',
  },
  {
    role: 'ejecutiva',
    title: 'Cuenta demo',
    name: 'Ejecutiva 2',
    email: 'ejecutiva2@ejemplo.com',
    password: 'demo1234',
  },
  {
    role: 'ejecutiva',
    title: 'Cuenta demo',
    name: 'Ejecutiva 3',
    email: 'ejecutiva3@ejemplo.com',
    password: 'demo1234',
  },
  {
    role: 'ejecutiva',
    title: 'Cuenta demo',
    name: 'Ejecutiva 4',
    email: 'ejecutiva4@ejemplo.com',
    password: 'demo1234',
  },
]

/**
 * Get access account by email
 */
export function getAccessAccountByEmail(email: string) {
  return ACCESS_ACCOUNTS.find((acc) => acc.email === email)
}

/**
 * Get access account by role
 */
export function getAccessAccountByRole(role: string) {
  return ACCESS_ACCOUNTS.find((acc) => acc.role === role)
}
