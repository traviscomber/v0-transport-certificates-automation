/**
 * Legacy password utility functions for transportista authentication.
 * Do not expose generated values in UI responses or logs.
 */

export function generateDefaultPassword(rut: string): string {
  const rutWithoutVerifier = rut.split('-')[0]
  const last4 = rutWithoutVerifier.slice(-4)
  return `labbe${last4}`
}

export function validatePasswordForRut(password: string, rut: string): boolean {
  const expectedPassword = generateDefaultPassword(rut)
  return password === expectedPassword
}
