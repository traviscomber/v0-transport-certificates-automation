'use client'

// Placeholder access accounts for local login helpers.
export const ACCESS_ACCOUNTS = [
  {
    role: 'ejecutiva',
    title: 'Acceso interno',
    name: 'Ejecutiva 1',
    email: 'usuario1@acceso.local',
    password: 'cambiar1234',
  },
  {
    role: 'ejecutiva',
    title: 'Acceso interno',
    name: 'Ejecutiva 2',
    email: 'usuario2@acceso.local',
    password: 'cambiar1234',
  },
  {
    role: 'ejecutiva',
    title: 'Acceso interno',
    name: 'Ejecutiva 3',
    email: 'usuario3@acceso.local',
    password: 'cambiar1234',
  },
  {
    role: 'ejecutiva',
    title: 'Acceso interno',
    name: 'Ejecutiva 4',
    email: 'usuario4@acceso.local',
    password: 'cambiar1234',
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
