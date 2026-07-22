'use client'

type AccessAccount = {
  role: string
  title: string
  name: string
  email: string
}

// Static access accounts are intentionally empty in production-safe builds.
export const ACCESS_ACCOUNTS: AccessAccount[] = []

export function getAccessAccountByEmail(email: string) {
  return ACCESS_ACCOUNTS.find((acc) => acc.email === email)
}

export function getAccessAccountByRole(role: string) {
  return ACCESS_ACCOUNTS.find((acc) => acc.role === role)
}
