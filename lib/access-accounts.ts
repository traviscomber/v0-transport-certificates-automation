'use client'

// Single source of truth for access accounts used in the login screen
export const ACCESS_ACCOUNTS = [
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
