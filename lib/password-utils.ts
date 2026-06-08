/**
 * Password utility functions for transportista authentication
 * Pattern: labbe + last 4 digits of RUT (before the verifier digit)
 * Example: RUT 78315368-8 → password labbe5368
 */

export function generateDefaultPassword(rut: string): string {
  // Extract the 4 digits before the hyphen
  const rutWithoutVerifier = rut.split('-')[0] // "78315368"
  const last4 = rutWithoutVerifier.slice(-4) // "5368"
  const password = `labbe${last4}` // "labbe5368"
  
  console.log(`[v0] Password formula: labbe + last 4 digits before hyphen`)
  console.log(`[v0]   RUT: ${rut}`)
  console.log(`[v0]   RUT without verifier: ${rutWithoutVerifier}`)
  console.log(`[v0]   Last 4 digits: ${last4}`)
  console.log(`[v0]   Generated password: ${password}`)
  
  return password
}

/**
 * Validate password against RUT
 * Returns true if password matches the expected pattern
 */
export function validatePasswordForRut(password: string, rut: string): boolean {
  const expectedPassword = generateDefaultPassword(rut)
  return password === expectedPassword
}
